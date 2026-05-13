const router = require('express').Router();
const auth   = require('../middleware/auth');
const { analyzeJob } = require('../controllers/aiController');

router.post('/analyze', auth, analyzeJob);

module.exports = router;