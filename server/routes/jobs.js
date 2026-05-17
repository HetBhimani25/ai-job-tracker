const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');

const upload = require('../middleware/upload');

router.get('/', auth, getJobs);
router.post('/', auth, upload.fields([{ name: 'jdFile', maxCount: 1 }, { name: 'resumeFile', maxCount: 1 }]), createJob);
router.put('/:id', auth, upload.fields([{ name: 'jdFile', maxCount: 1 }, { name: 'resumeFile', maxCount: 1 }]), updateJob);
router.delete('/:id', auth, deleteJob);

module.exports = router;