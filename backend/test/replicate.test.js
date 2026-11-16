// Unit tests for the Replicate visual. The client is mocked: no API calls, no cost.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');

delete process.env.REPLICATE_MODEL;

const { generateVisual, buildDemoVisual, readOutput, DEFAULT_MODEL } = require('../utils/replicate');

const jpeg = (w = 64, h = 48) => sharp({
    create: { width: w, height: h, channels: 3, background: { r: 120, g: 140, b: 160 } },
}).jpeg().toBuffer();

// Mimics the client's FileOutput: a ReadableStream with .blob() and .url().
const fileOutput = (buffer) => {
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(new Uint8Array(buffer));
            controller.close();
        },
    });
    stream.blob = async () => new Blob([buffer], { type: 'image/jpeg' });
    stream.url = () => new URL('https://replicate.delivery/fake/output.jpg');
    return stream;
};

const mockReplicate = (respond) => {
    const calls = [];
    return {
        calls,
        run: async (model, options) => {
            calls.push({ model, options });
            return respond(model, options);
        },
    };
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

test('sends the photo and prompt with the exact FLUX Kontext input', async () => {
    const photo = await jpeg();
    const result = await jpeg(80, 60);
    const client = mockReplicate(() => fileOutput(result));

    const buffer = await generateVisual({ imageBuffer: photo, prompt: 'Keep the same room; add a jute rug.', replicate: client });

    assert.equal(client.calls.length, 1);
    const { model, options } = client.calls[0];
    assert.equal(model, DEFAULT_MODEL);
    assert.equal(DEFAULT_MODEL, 'black-forest-labs/flux-kontext-pro');
    assert.deepEqual(Object.keys(options.input).sort(), ['aspect_ratio', 'input_image', 'output_format', 'prompt', 'safety_tolerance']);
    assert.equal(options.input.prompt, 'Keep the same room; add a jute rug.');
    assert.equal(options.input.input_image, photo);
    assert.equal(options.input.aspect_ratio, 'match_input_image');
    assert.equal(options.input.output_format, 'jpg');
    assert.equal(options.input.safety_tolerance, 2);
    assert.deepEqual(options.wait, { mode: 'block' });
    assert.ok(options.signal instanceof AbortSignal);

    assert.deepEqual(buffer, result);
});

test('REPLICATE_MODEL overrides the model', async () => {
    process.env.REPLICATE_MODEL = 'black-forest-labs/flux-kontext-max';
    try {
        const client = mockReplicate(async () => fileOutput(await jpeg()));
        await generateVisual({ imageBuffer: await jpeg(), prompt: 'x', replicate: client });
        assert.equal(client.calls[0].model, 'black-forest-labs/flux-kontext-max');
    } finally {
        delete process.env.REPLICATE_MODEL;
    }
});

test('handles FileOutput, arrays, plain URLs and raw streams', async () => {
    const image = await jpeg();

    assert.deepEqual(await readOutput(fileOutput(image)), image);
    assert.deepEqual(await readOutput([fileOutput(image)]), image);

    const fetched = [];
    const fakeFetch = async (url) => {
        fetched.push(url);
        return new Response(image, { status: 200 });
    };
    assert.deepEqual(await readOutput('https://replicate.delivery/x.jpg', fakeFetch), image);
    assert.deepEqual(await readOutput(['https://replicate.delivery/y.jpg'], fakeFetch), image);
    assert.deepEqual(fetched, ['https://replicate.delivery/x.jpg', 'https://replicate.delivery/y.jpg']);

    const rawStream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(image)); c.close(); } });
    assert.deepEqual(await readOutput(rawStream), image);

    await assert.rejects(readOutput(null), /no image/);
    await assert.rejects(readOutput([]), /no image/);
});

test('a string URL output is downloaded and stored, not linked', async () => {
    const image = await jpeg();
    const client = mockReplicate(() => 'https://replicate.delivery/abc/out.jpg');
    const buffer = await generateVisual({
        imageBuffer: await jpeg(),
        prompt: 'x',
        replicate: client,
        fetchImpl: async () => new Response(image, { status: 200 }),
    });
    assert.deepEqual(buffer, image);
});

test('safety rejections become AI_VISUAL_REFUSED (422)', async () => {
    const client = mockReplicate(() => {
        throw new Error('Prediction failed: Content flagged as NSFW by the safety checker');
    });
    await assert.rejects(
        generateVisual({ imageBuffer: await jpeg(), prompt: 'x', replicate: client }),
        (error) => error.code === 'AI_VISUAL_REFUSED' && error.status === 422,
    );
});

test('other failures become AI_VISUAL_FAILED (502)', async () => {
    const failing = mockReplicate(() => {
        throw new Error('Prediction failed: CUDA out of memory');
    });
    await silenceErrors(() => assert.rejects(
        generateVisual({ imageBuffer: Buffer.from('x'), prompt: 'x', replicate: failing }),
        (error) => error.code === 'AI_VISUAL_FAILED' && error.status === 502,
    ));

    const badToken = mockReplicate(() => {
        const error = new Error('Request to https://api.replicate.com/v1/models failed with status 401');
        error.response = { status: 401 };
        throw error;
    });
    await silenceErrors(() => assert.rejects(
        generateVisual({ imageBuffer: Buffer.from('x'), prompt: 'x', replicate: badToken }),
        (error) => error.code === 'AI_VISUAL_FAILED' && /not set up/.test(error.message),
    ));

    const notAnImage = mockReplicate(() => fileOutput(Buffer.from('<html>error</html>')));
    await silenceErrors(() => assert.rejects(
        generateVisual({ imageBuffer: Buffer.from('x'), prompt: 'x', replicate: notAnImage }),
        (error) => error.code === 'AI_VISUAL_FAILED',
    ));
});

test('a timeout cancels the run and becomes AI_VISUAL_FAILED', async () => {
    // Like the real client: when the signal aborts it cancels and returns without throwing.
    const slow = mockReplicate((model, { signal }) => new Promise((resolve) => {
        signal.addEventListener('abort', () => resolve(null));
    }));
    await assert.rejects(
        generateVisual({ imageBuffer: Buffer.from('x'), prompt: 'x', replicate: slow, timeoutMs: 20 }),
        (error) => error.code === 'AI_VISUAL_FAILED' && /too long/.test(error.message),
    );
});

test('the demo visual keeps the size and is a labelled WebP', async () => {
    const original = await jpeg(400, 300);
    const demo = await buildDemoVisual(original);
    const meta = await sharp(demo).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.width, 400);
    assert.equal(meta.height, 300);
    assert.notDeepEqual(demo, original);

    // Tiny photos still work (the label band is clamped to the image height).
    const tiny = await buildDemoVisual(await jpeg(32, 24));
    assert.equal((await sharp(tiny).metadata()).height, 24);
});
