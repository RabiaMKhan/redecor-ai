// Local server (`npm run dev` / `npm start`). On Vercel, api/index.js is used instead.
require('dotenv').config();

const app = require('./server');
const { ensureConnected } = require('./Models/db');
const { isDemoMode, getModel } = require('./utils/claude');
const { isVisualDemoMode, getReplicateModel } = require('./utils/replicate');
const { isMailConfigured } = require('./utils/mailer');

const PORT = process.env.PORT || 8080;

const start = async () => {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing. Copy .env.example to .env and fill it in.');
        process.exit(1);
    }

    try {
        await ensureConnected();
        console.log('db connected successfully');
    } catch (error) {
        console.error('error connecting to db:', error.message);
        process.exit(1);
    }

    console.log('Storage: images are stored in MongoDB (media collection)');
    console.log(isDemoMode()
        ? 'Analysis: DEMO (no Claude calls; set ANTHROPIC_API_KEY and AI_DEMO_MODE=false for real analysis)'
        : `Analysis: LIVE (Claude model ${getModel()})`);
    console.log(isVisualDemoMode()
        ? 'Visual: DEMO (no Replicate calls; set REPLICATE_API_TOKEN and VISUAL_DEMO_MODE=false for real visuals)'
        : `Visual: LIVE (Replicate model ${getReplicateModel()})`);
    console.log(isMailConfigured()
        ? 'Mail: sending through Gmail'
        : 'Mail: not configured, emails are printed to this console as [dev-mail]');

    app.listen(PORT, () => {
        console.log(`Backend is running on ${PORT}`);
    });
};

start();
