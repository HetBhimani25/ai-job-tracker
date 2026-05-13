const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/jobController');

router.get('/',        auth, getJobs);
router.post('/',       auth, createJob);
router.put('/:id',     auth, updateJob);
router.delete('/:id',  auth, deleteJob);

module.exports = router;