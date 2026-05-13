const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch { res.status(500).json({ msg: 'Server error' }); }
};

exports.createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body, user: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch { res.status(500).json({ msg: 'Server error' }); }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json(job);
  } catch { res.status(500).json({ msg: 'Server error' }); }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json({ msg: 'Job removed' });
  } catch { res.status(500).json({ msg: 'Server error' }); }
};