const router = require('express').Router();
const { serveMedia } = require('../controllers/MediaController');

router.get('/:file', serveMedia);

module.exports = router;
