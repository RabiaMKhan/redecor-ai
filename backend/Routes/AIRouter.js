const router = require('express').Router();

const { analyze, visualize, listDesigns, getDesign, deleteDesign } = require('../controllers/AIController');
const { analyzeValidation } = require('../controllers/AuthValidation');
const { ensureAuthenticated } = require('../Middlewares/Auth');
const { roomImageUpload } = require('../Middlewares/Upload');
const { analyzeLimiter, visualizeLimiter } = require('../Middlewares/RateLimit');

// Every AI route needs a signed-in user. Auth runs before the upload,
// so anonymous requests never get to send a 10 MB file.
router.use(ensureAuthenticated);

router.post('/analyze', analyzeLimiter, roomImageUpload, analyzeValidation, analyze);

router.get('/designs', listDesigns);
router.get('/designs/:id', getDesign);
router.post('/designs/:id/visualize', visualizeLimiter, visualize);
router.delete('/designs/:id', deleteDesign);

module.exports = router;
