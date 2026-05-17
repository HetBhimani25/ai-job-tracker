const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch { res.status(500).json({ msg: 'Server error' }); }
};

const pdfParse = require('pdf-parse');

const parsePDF = async (buffer) => {
  try {
    return await pdfParse(buffer);
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw err;
  }
};

exports.createJob = async (req, res) => {
  try {
    let { company, role, status, jobDescription, notes, followUpDate } = req.body;
    let jdFileName = '';
    let resumeFileName = '';

    // Extract text from files if present
    if (req.files) {
      if (req.files.jdFile) {
        const file = req.files.jdFile[0];
        jdFileName = file.originalname;
        if (file.mimetype === 'application/pdf') {
          const data = await parsePDF(file.buffer);
          jobDescription = data.text;
        } else {
          jobDescription = file.buffer.toString('utf-8');
        }
      }

      if (req.files.resumeFile) {
        const file = req.files.resumeFile[0];
        resumeFileName = file.originalname;
        if (file.mimetype === 'application/pdf') {
          const data = await parsePDF(file.buffer);
          resumeText = data.text;
        } else {
          resumeText = file.buffer.toString('utf-8');
        }
      }
    }

    const job = new Job({
      user: req.user.id,
      company,
      role,
      status,
      jobDescription,
      jdFileName,
      resumeText,
      resumeFileName,
      notes,
      followUpDate
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.files) {
      if (req.files.jdFile) {
        const file = req.files.jdFile[0];
        updateData.jdFileName = file.originalname;
        if (file.mimetype === 'application/pdf') {
          const data = await parsePDF(file.buffer);
          updateData.jobDescription = data.text;
        } else {
          updateData.jobDescription = file.buffer.toString('utf-8');
        }
      }

      if (req.files.resumeFile) {
        const file = req.files.resumeFile[0];
        updateData.resumeFileName = file.originalname;
        if (file.mimetype === 'application/pdf') {
          const data = await parsePDF(file.buffer);
          updateData.resumeText = data.text;
        } else {
          updateData.resumeText = file.buffer.toString('utf-8');
        }
      }
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { returnDocument: 'after' }
    );
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    res.json({ msg: 'Job removed' });
  } catch { res.status(500).json({ msg: 'Server error' }); }
};