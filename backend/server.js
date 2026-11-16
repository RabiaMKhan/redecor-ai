const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const AuthRouter = require('./Routes/AuthRouter');
const AIRouter = require('./Routes/AIRouter');
const MediaRouter = require('./Routes/MediaRouter');
const { notFound, errorHandler } = require('./Middlewares/ErrorHandler');
const { makeRequireDatabase } = require('./Models/db');

const app = express();

// Behind a proxy (Vercel, Render, Nginx) this makes req.protocol (https) and req.ip
// (used by the rate limiters) correct.
if (process.env.VERCEL || process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable('x-powered-by');
// "cross-origin" lets the React app (another origin) show the signed /media images.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/ping', (req, res) => {
    res.send('Pong');
});

// Serverless functions start cold: connect (once) before any route touches the DB.
// Runs after CORS so a 503 is readable by the browser.
app.use(makeRequireDatabase());

app.use('/auth', AuthRouter);
app.use('/ai', AIRouter);
// Private room photos, visuals and profile photos, only through signed, expiring URLs.
app.use('/media', MediaRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
