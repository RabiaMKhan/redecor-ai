// The "visual result": Replicate's FLUX Kontext edits the user's own photo into the
// redesigned version, so the room's layout and camera angle stay the same.
const Replicate = require('replicate');
const sharp = require('sharp');
const { AppError } = require('./AppError');

const DEFAULT_MODEL = 'black-forest-labs/flux-kontext-pro';
const DEFAULT_TIMEOUT_MS = 120 * 1000;

const getReplicateModel = () => process.env.REPLICATE_MODEL || DEFAULT_MODEL;

// Visual demo = no Replicate calls. On when there is no token, or forced with VISUAL_DEMO_MODE=true.
const isVisualDemoMode = () => process.env.VISUAL_DEMO_MODE === 'true' || !process.env.REPLICATE_API_TOKEN;

let client = null;
const getClient = () => {
    if (!client) {
        client = new Replicate(); // reads REPLICATE_API_TOKEN
    }
    return client;
};

// Input for black-forest-labs/flux-kontext-pro (schema checked on replicate.com).
// safety_tolerance 2 is the maximum allowed when an input image is used.
const buildVisualInput = ({ imageBuffer, prompt }) => ({
    prompt,
    input_image: imageBuffer, // the client uploads Buffers for us
    aspect_ratio: 'match_input_image',
    output_format: 'jpg',
    safety_tolerance: 2,
});

// The client returns a FileOutput (a ReadableStream with .blob()), but older
// versions or other models may return a URL string or an array. Handle all of them.
const readOutput = async (output, fetchImpl = fetch) => {
    let value = Array.isArray(output) ? output[0] : output;
    if (!value) {
        throw new Error('Replicate returned no image');
    }
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof Uint8Array) return Buffer.from(value);
    if (typeof value === 'string' || value instanceof URL) {
        const response = await fetchImpl(String(value));
        if (!response.ok) {
            throw new Error(`Could not download the generated image (${response.status})`);
        }
        return Buffer.from(await response.arrayBuffer());
    }
    if (typeof value.blob === 'function') {
        const blob = await value.blob();
        return Buffer.from(await blob.arrayBuffer());
    }
    if (typeof value.getReader === 'function') {
        return Buffer.from(await new Response(value).arrayBuffer());
    }
    throw new Error('Unexpected output from Replicate');
};

const SAFETY_RE = /nsfw|safety|flagged|sensitive|content policy|moderat/i;

/**
 * Sends the stored photo and Claude's image prompt to Replicate.
 * Returns the generated image as a Buffer, or throws an AppError
 * (AI_VISUAL_REFUSED 422 for safety rejections, AI_VISUAL_FAILED 502 otherwise).
 */
const generateVisual = async ({ imageBuffer, prompt, replicate = getClient(), timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let output;
    try {
        output = await replicate.run(getReplicateModel(), {
            input: buildVisualInput({ imageBuffer, prompt }),
            wait: { mode: 'block' },
            signal: controller.signal,
        });
    } catch (error) {
        if (SAFETY_RE.test(error?.message || '')) {
            throw new AppError(422, 'The image service could not redesign this photo. Please try a different photo.', 'AI_VISUAL_REFUSED');
        }
        const status = error?.response?.status;
        console.error('Replicate request failed:', status || '', error?.message);
        const message = status === 401 || status === 402 || status === 403
            ? 'The image service is not set up correctly.'
            : 'Could not create the visual. Please try again.';
        throw new AppError(502, message, 'AI_VISUAL_FAILED');
    } finally {
        clearTimeout(timer);
    }

    // On timeout the client cancels the prediction and returns without throwing.
    if (controller.signal.aborted) {
        throw new AppError(502, 'The visual took too long. Please try again.', 'AI_VISUAL_FAILED');
    }

    let buffer;
    try {
        buffer = await readOutput(output, fetchImpl);
        await sharp(buffer).metadata(); // make sure it is really an image
    } catch (error) {
        console.error('Replicate output could not be read:', error.message);
        throw new AppError(502, 'Could not create the visual. Please try again.', 'AI_VISUAL_FAILED');
    }
    return buffer;
};

const escapeXml = (text) => text.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

/**
 * Demo visual (no Replicate token): the original photo with a warm colour grade
 * and a clear "DEMO PREVIEW" band, so nobody mistakes it for an AI redesign.
 */
const buildDemoVisual = async (originalBuffer) => {
    const graded = sharp(originalBuffer)
        .rotate()
        .modulate({ brightness: 1.06, saturation: 0.9 })
        .recomb([
            [1.06, 0.03, 0],
            [0.01, 1.0, 0.01],
            [0, 0.02, 0.9],
        ]);

    const { data, info } = await graded.toBuffer({ resolveWithObject: true });
    const width = info.width;
    const height = info.height;
    // The band can't be taller than the image (sharp refuses overlays larger than the base).
    const bandHeight = Math.min(height, Math.max(36, Math.round(height * 0.09)));
    const fontSize = Math.max(12, Math.round(bandHeight * 0.36));
    const label = escapeXml('DEMO PREVIEW · add a Replicate key for the real redesign');

    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${bandHeight}">
  <rect width="100%" height="100%" fill="#2A2421" fill-opacity="0.78"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="1" fill="#FCFAF6">${label}</text>
</svg>`);

    return sharp(data)
        .composite([{ input: svg, top: height - bandHeight, left: 0 }])
        .webp({ quality: 82 })
        .toBuffer();
};

module.exports = {
    generateVisual,
    buildVisualInput,
    buildDemoVisual,
    readOutput,
    isVisualDemoMode,
    getReplicateModel,
    DEFAULT_MODEL,
};
