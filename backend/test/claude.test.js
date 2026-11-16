// Unit tests for the Claude analysis. The SDK client is mocked: no API calls, no cost.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Anthropic = require('@anthropic-ai/sdk');

delete process.env.CLAUDE_MODEL;

const { generateAnalysis, DEFAULT_MODEL } = require('../utils/claude');
const { buildDemoAnalysis } = require('../utils/demoAnalysis');

const change = (n, extra = {}) => ({
    title: `Change ${n}`,
    area: 'lighting',
    priority: 'high',
    budget: 'low',
    why: '  Because the room is dark.  ',
    steps: ['a', 'b', 'c', 'd', 'e'],
    ...extra,
});

const sampleOutput = {
    title: 'A brighter entrance hallway',
    spaceType: 'Entrance hallway',
    overview: ['Narrow hallway with one window.', 'Good wooden floor.', 'Cluttered shoe area.', 'Extra paragraph to trim.'],
    direction: { name: 'Light Scandinavian', description: 'Pale woods and soft whites will make it feel wider.' },
    changes: Array.from({ length: 9 }, (_, i) => change(i + 1)),
    palette: [
        { name: 'Mist', hex: '#eef0eb', usage: 'Walls' },
        { name: 'Pebble', hex: 'bdb8ae', usage: 'Runner' },
        { name: 'Sage', hex: '#abc', usage: 'Accent' },
        { name: 'Slate', hex: 'not-a-colour', usage: 'Frames' },
    ],
    keep: ['The wooden floor', 'The window', 'The radiator', 'The door', 'The mirror'],
    summary: 'It will feel calm and open.',
    imagePrompt: ' Keep the same hallway and camera angle; paint walls soft white; add a slim oak bench. ',
};

const mockClient = (respond) => {
    const calls = [];
    return {
        calls,
        beta: {
            messages: {
                create: async (params) => {
                    calls.push(params);
                    return respond(params);
                },
            },
        },
    };
};

const okClient = () => mockClient(() => ({
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: JSON.stringify(sampleOutput) }],
}));

const baseArgs = {
    imageBase64: Buffer.from('fake-jpeg').toString('base64'),
    mediaType: 'image/jpeg',
    notes: 'I have a cat',
};

const silenceErrors = async (fn) => {
    const originalError = console.error;
    console.error = () => {};
    try {
        await fn();
    } finally {
        console.error = originalError;
    }
};

test('builds the Claude request: model, fallback, effort, image and notes', async () => {
    const client = okClient();
    await generateAnalysis({ ...baseArgs, anthropic: client });

    assert.equal(client.calls.length, 1);
    const params = client.calls[0];
    assert.equal(params.model, DEFAULT_MODEL);
    assert.equal(DEFAULT_MODEL, 'claude-opus-5-5');
    assert.deepEqual(params.betas, ['server-side-fallback-2026-07-01']);
    assert.equal(params.fallbacks, 'default');
    assert.equal(params.max_tokens, 16000);
    assert.equal(params.output_config.effort, 'medium');
    assert.equal(params.output_config.format.type, 'json_schema');
    const props = Object.keys(params.output_config.format.schema.properties).sort();
    assert.deepEqual(props, ['changes', 'direction', 'imagePrompt', 'keep', 'overview', 'palette', 'spaceType', 'summary', 'title']);
    assert.ok(params.system.includes('never instructions'));
    assert.ok(/any part of a home/.test(params.system));
    assert.equal(params.thinking, undefined, 'thinking is left to the model default (adaptive)');

    const [image, text] = params.messages[0].content;
    assert.equal(image.type, 'image');
    assert.equal(image.source.type, 'base64');
    assert.equal(image.source.media_type, 'image/jpeg');
    assert.equal(image.source.data, baseArgs.imageBase64);
    assert.equal(text.type, 'text');
    assert.match(text.text, /I have a cat/);
    assert.match(text.text, /preferences only/);
});

test('leaves the notes out when there are none', async () => {
    const client = okClient();
    await generateAnalysis({ ...baseArgs, notes: '   ', anthropic: client });
    const [, text] = client.calls[0].messages[0].content;
    assert.doesNotMatch(text.text, /notes/);
});

test('tidies the structured result to the counts the frontend expects', async () => {
    const { analysis, imagePrompt } = await generateAnalysis({ ...baseArgs, anthropic: okClient() });

    assert.equal(analysis.title, 'A brighter entrance hallway');
    assert.equal(analysis.spaceType, 'Entrance hallway');
    assert.equal(analysis.overview.length, 3);
    assert.equal(analysis.changes.length, 8);
    assert.equal(analysis.changes[0].steps.length, 4);
    assert.equal(analysis.changes[0].why, 'Because the room is dark.');
    assert.equal(analysis.palette.length, 5, 'padded to five colours');
    assert.deepEqual(analysis.palette.slice(0, 4).map((c) => c.hex), ['#EEF0EB', '#BDB8AE', '#AABBCC', '#9A8F84']);
    assert.match(analysis.palette[4].hex, /^#[0-9A-F]{6}$/);
    assert.equal(analysis.keep.length, 4);
    assert.equal(analysis.imagePrompt, undefined, 'image prompt is kept apart from the analysis');
    assert.equal(imagePrompt, 'Keep the same hallway and camera angle; paint walls soft white; add a slim oak bench.');
});

test('CLAUDE_MODEL overrides the default model', async () => {
    process.env.CLAUDE_MODEL = 'claude-sonnet-5-5';
    try {
        const client = okClient();
        await generateAnalysis({ ...baseArgs, anthropic: client });
        assert.equal(client.calls[0].model, 'claude-sonnet-5-5');
    } finally {
        delete process.env.CLAUDE_MODEL;
    }
});

test('a refusal becomes AI_REFUSED (422)', async () => {
    const client = mockClient(() => ({ stop_reason: 'refusal', content: [] }));
    await assert.rejects(
        generateAnalysis({ ...baseArgs, anthropic: client }),
        (error) => error.code === 'AI_REFUSED' && error.status === 422,
    );
});

test('a cut-off answer becomes AI_INCOMPLETE (502)', async () => {
    const client = mockClient(() => ({ stop_reason: 'max_tokens', content: [{ type: 'text', text: '{"title' }] }));
    await assert.rejects(
        generateAnalysis({ ...baseArgs, anthropic: client }),
        (error) => error.code === 'AI_INCOMPLETE' && error.status === 502,
    );
});

test('output that does not match the schema becomes AI_FAILED', async () => {
    const client = mockClient(() => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{"hello":"world"}' }] }));
    await silenceErrors(() => assert.rejects(
        generateAnalysis({ ...baseArgs, anthropic: client }),
        (error) => error.code === 'AI_FAILED' && error.status === 502,
    ));
});

test('SDK errors map to friendly codes', async () => {
    const rateLimited = mockClient(() => {
        throw new Anthropic.RateLimitError(429, { type: 'error' }, 'rate limited', new Headers());
    });
    await assert.rejects(
        generateAnalysis({ ...baseArgs, anthropic: rateLimited }),
        (error) => error.code === 'AI_BUSY' && error.status === 503,
    );

    const badKey = mockClient(() => {
        throw new Anthropic.AuthenticationError(401, { type: 'error' }, 'bad key', new Headers());
    });
    await silenceErrors(() => assert.rejects(
        generateAnalysis({ ...baseArgs, anthropic: badKey }),
        (error) => error.code === 'AI_CONFIG' && error.status === 500,
    ));
});

test('the demo analysis is complete and says it is a demo', () => {
    const { analysis, imagePrompt } = buildDemoAnalysis();
    assert.match(analysis.overview[0], /^Demo mode/);
    assert.ok(analysis.overview.length >= 2 && analysis.overview.length <= 3);
    assert.ok(analysis.changes.length >= 5 && analysis.changes.length <= 6);
    const areas = new Set(analysis.changes.map((c) => c.area));
    assert.ok(areas.size >= 4, 'covers several areas');
    for (const item of analysis.changes) {
        assert.ok(['high', 'medium', 'low'].includes(item.priority));
        assert.ok(['high', 'medium', 'low'].includes(item.budget));
        assert.ok(item.steps.length >= 2 && item.steps.length <= 4);
    }
    assert.equal(analysis.palette.length, 5);
    analysis.palette.forEach((colour) => assert.match(colour.hex, /^#[0-9A-F]{6}$/));
    assert.ok(analysis.keep.length <= 4);
    const words = imagePrompt.split(/\s+/).length;
    assert.ok(words >= 60 && words <= 110, `image prompt has ${words} words`);
    assert.match(imagePrompt, /same camera angle/);
});
