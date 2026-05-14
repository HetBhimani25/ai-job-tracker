const router = require('express').Router();
const auth   = require('../middleware/auth');
const { analyzeJob, coverLetter, interviewPrep } = require('../controllers/aiController');

router.post('/analyze',   auth, analyzeJob);
router.post('/cover-letter', auth, coverLetter);
router.post('/interview-prep', auth, interviewPrep);

module.exports = router;