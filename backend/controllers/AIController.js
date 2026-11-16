const mongoose = require('mongoose');
const sharp = require('sharp');

const designModel = require('../Models/Designs');
const usageModel = require('../Models/Usage');
const { AppError, asyncHandler, sendSuccess } = require('../utils/AppError');
const { generateAnalysis, isDemoMode } = require('../utils/claude');
const { buildDemoAnalysis } = require('../utils/demoAnalysis');
const { generateVisual, buildDemoVisual, isVisualDemoMode } = require('../utils/replicate');
const storage = require('../utils/storage');

const DAY_MS = 24 * 60 * 60 * 1000;
const PROCESSING_TIMEOUT_MS = 3 * 60 * 1000; // a stuck "processing" visual can be retried after this
const MAX_IMAGE_EDGE = 1568; // larger images are downscaled by Claude anyway

// Guests (one-click demo accounts) get smaller daily limits.
const analysisLimit = (user) => (user?.isGuest
    ? Number(process.env.GUEST_AI_DAILY_LIMIT) || 5
    : Number(process.env.AI_DAILY_LIMIT) || 20);
const visualLimit = (user) => (user?.isGuest
    ? Number(process.env.GUEST_VISUAL_DAILY_LIMIT) || 5
    : Number(process.env.VISUAL_DAILY_LIMIT) || 10);
const demoVisualDelay = () => (process.env.NODE_ENV === 'test' ? 0 : 1500);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findOwnDesign = async (req, extraFields = '') => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(404, 'Design not found.', 'NOT_FOUND');
    }
    const query = designModel.findOne({ _id: id, user: req.user._id });
    const design = await (extraFields ? query.select(extraFields) : query);
    if (!design) {
        throw new AppError(404, 'Design not found.', 'NOT_FOUND');
    }
    return design;
};

const deleteDesignFiles = async (design) => {
    await storage.deleteFile(design.originalFile);
    if (design.visual?.file) await storage.deleteFile(design.visual.file);
};

// POST /ai/analyze
const analyze = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError(400, 'Please upload a photo of your space.', 'IMAGE_REQUIRED');
    }
    const notes = req.body.notes || '';

    const used = await usageModel.countSince(req.user._id, 'analysis', new Date(Date.now() - DAY_MS));
    const limit = analysisLimit(req.user);
    if (used >= limit) {
        throw new AppError(429, `You can analyse ${limit} photos per day. Please try again tomorrow.`, 'DAILY_LIMIT');
    }

    // Normalise the photo once: this exact JPEG goes to Claude, is stored as the
    // "before" image, and is what Replicate later redesigns.
    let jpegBuffer;
    try {
        jpegBuffer = await sharp(req.file.buffer)
            .rotate()
            .resize({ width: MAX_IMAGE_EDGE, height: MAX_IMAGE_EDGE, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
    } catch (error) {
        throw new AppError(400, 'That file is not a valid image.', 'INVALID_IMAGE');
    }

    // Count the attempt before the paid call, so failures still count towards the limit.
    await usageModel.create({ user: req.user._id, kind: 'analysis' });

    const demo = isDemoMode();
    const { analysis, imagePrompt } = demo
        ? buildDemoAnalysis()
        : await generateAnalysis({ imageBase64: jpegBuffer.toString('base64'), mediaType: 'image/jpeg', notes });

    // Only store the photo once the analysis worked, so failures leave no files behind.
    const originalFile = await storage.saveFile(jpegBuffer, 'jpg', { owner: req.user._id });
    let design;
    try {
        design = await designModel.create({
            user: req.user._id,
            notes,
            demo: { analysis: demo, visual: false },
            originalFile,
            analysis,
            imagePrompt,
            visual: { status: 'pending' },
        });
    } catch (error) {
        await storage.deleteFile(originalFile);
        throw error;
    }

    sendSuccess(res, 201, demo ? 'Sample analysis created (demo mode)' : 'Your space has been analysed.', design.toPublic(req));
});

// POST /ai/designs/:id/visualize
const visualize = asyncHandler(async (req, res) => {
    const design = await findOwnDesign(req, '+imagePrompt');

    const used = await usageModel.countSince(req.user._id, 'visual', new Date(Date.now() - DAY_MS));
    const limit = visualLimit(req.user);
    if (used >= limit) {
        throw new AppError(429, `You can create ${limit} visuals per day. Please try again tomorrow.`, 'VISUAL_DAILY_LIMIT');
    }

    // Claim the design atomically so two clicks can't start two paid generations.
    const now = new Date();
    const claim = await designModel.updateOne(
        {
            _id: design._id,
            user: req.user._id,
            $or: [
                { 'visual.status': { $ne: 'processing' } },
                { 'visual.startedAt': { $lt: new Date(now.getTime() - PROCESSING_TIMEOUT_MS) } },
            ],
        },
        { $set: { 'visual.status': 'processing', 'visual.startedAt': now, 'visual.updatedAt': now }, $unset: { 'visual.error': '' } },
    );
    if (claim.modifiedCount === 0) {
        throw new AppError(409, 'Your visual is already being created. Please wait a moment.', 'VISUAL_IN_PROGRESS');
    }

    await usageModel.create({ user: req.user._id, kind: 'visual' });

    const demo = isVisualDemoMode();
    const previousFile = design.visual?.file;
    try {
        const original = await storage.readFile(design.originalFile);
        let webp;
        if (demo) {
            await sleep(demoVisualDelay());
            webp = await buildDemoVisual(original);
        } else {
            const generated = await generateVisual({ imageBuffer: original, prompt: design.imagePrompt });
            webp = await sharp(generated).webp({ quality: 82 }).toBuffer();
        }

        const file = await storage.saveFile(webp, 'webp', { owner: req.user._id });
        await designModel.updateOne(
            { _id: design._id },
            {
                $set: {
                    'visual.status': 'ready',
                    'visual.file': file,
                    'visual.demo': demo,
                    'visual.updatedAt': new Date(),
                    'demo.visual': demo,
                },
                $unset: { 'visual.error': '' },
            },
        );
        if (previousFile && previousFile !== file) await storage.deleteFile(previousFile);
    } catch (error) {
        const appError = error instanceof AppError
            ? error
            : new AppError(502, 'Could not create the visual. Please try again.', 'AI_VISUAL_FAILED');
        if (!(error instanceof AppError)) console.error('Visual generation failed:', error.message);

        await designModel.updateOne(
            { _id: design._id },
            { $set: { 'visual.status': 'failed', 'visual.error': appError.message, 'visual.updatedAt': new Date() } },
        );
        throw appError;
    }

    const updated = await designModel.findById(design._id);
    sendSuccess(res, 200, demo ? 'Demo visual created (demo mode)' : 'Your visual is ready.', updated.toPublic(req));
});

// GET /ai/designs
const listDesigns = asyncHandler(async (req, res) => {
    const designs = await designModel
        .find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    sendSuccess(res, 200, 'Your designs', designs.map((design) => design.toPublic(req)));
});

// GET /ai/designs/:id
const getDesign = asyncHandler(async (req, res) => {
    const design = await findOwnDesign(req);
    sendSuccess(res, 200, 'Your design', design.toPublic(req));
});

// DELETE /ai/designs/:id
const deleteDesign = asyncHandler(async (req, res) => {
    const design = await findOwnDesign(req);
    await designModel.deleteOne({ _id: design._id });
    await deleteDesignFiles(design);
    sendSuccess(res, 200, 'Design deleted.');
});

module.exports = { analyze, visualize, listDesigns, getDesign, deleteDesign };
