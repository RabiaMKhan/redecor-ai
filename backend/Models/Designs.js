const mongoose = require('mongoose');
const { signUrl } = require('../utils/storage');

const Schema = mongoose.Schema;

const AREAS = ['layout', 'colour', 'lighting', 'furniture', 'textiles', 'storage', 'decor', 'flooring', 'walls', 'plants'];
const LEVELS = ['high', 'medium', 'low'];
const VISUAL_STATUSES = ['pending', 'processing', 'ready', 'failed'];

const paletteSchema = new Schema({
    name: String,
    hex: String,
    usage: String,
}, { _id: false });

const changeSchema = new Schema({
    title: String,
    area: { type: String, enum: AREAS },
    priority: { type: String, enum: LEVELS },
    budget: { type: String, enum: LEVELS },
    why: String,
    steps: [String],
}, { _id: false });

const analysisSchema = new Schema({
    title: String,
    spaceType: String,
    overview: [String],
    direction: {
        name: String,
        description: String,
    },
    changes: [changeSchema],
    palette: [paletteSchema],
    keep: [String],
    summary: String,
}, { _id: false });

const visualSchema = new Schema({
    status: { type: String, enum: VISUAL_STATUSES, default: 'pending' },
    file: String, // storage file name of the generated image
    error: String,
    demo: { type: Boolean, default: false },
    startedAt: Date,
    updatedAt: Date,
}, { _id: false });

// One analysed photo: the stored original, Claude's written plan and the visual result.
const designSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    notes: { type: String, default: '' },
    demo: {
        analysis: { type: Boolean, default: false },
        visual: { type: Boolean, default: false },
    },
    originalFile: { type: String, required: true },
    analysis: { type: analysisSchema, required: true },
    // Instruction for the image model. Internal only: never sent to the client.
    imagePrompt: { type: String, required: true, select: false },
    visual: { type: visualSchema, default: () => ({ status: 'pending' }) },
}, { timestamps: true });

designSchema.index({ user: 1, createdAt: -1 });

// The only design shape the API returns. Image URLs are signed and expire.
designSchema.methods.toPublic = function (req) {
    const analysis = this.analysis.toObject ? this.analysis.toObject() : this.analysis;
    const visual = this.visual || { status: 'pending' };

    const publicVisual = { status: visual.status || 'pending' };
    if (visual.status === 'ready' && visual.file) publicVisual.url = signUrl(req, visual.file);
    if (visual.status === 'failed' && visual.error) publicVisual.error = visual.error;
    if (visual.status === 'ready') publicVisual.demo = Boolean(visual.demo);
    if (visual.updatedAt) publicVisual.updatedAt = visual.updatedAt;

    return {
        id: this._id.toString(),
        notes: this.notes,
        createdAt: this.createdAt,
        demo: {
            analysis: Boolean(this.demo?.analysis),
            visual: Boolean(this.demo?.visual),
        },
        original: { url: signUrl(req, this.originalFile) },
        analysis,
        visual: publicVisual,
    };
};

const designModel = mongoose.model('designs', designSchema);

module.exports = designModel;
module.exports.AREAS = AREAS;
module.exports.LEVELS = LEVELS;
