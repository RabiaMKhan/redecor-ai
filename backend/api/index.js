// Vercel serverless entry. vercel.json sends every request here.
// The Express app connects to MongoDB on the first request (see Models/db.js),
// and answers 503 SERVICE_UNAVAILABLE if the database can't be reached.
const app = require('../server');

module.exports = (req, res) => app(req, res);
