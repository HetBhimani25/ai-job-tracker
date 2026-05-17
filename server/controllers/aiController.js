const { analyzeJD, generateCoverLetter, generateInterviewQuestions } = require('../services/aiService');

exports.analyzeJob = async (req, res) => {
  const { jobDescription, userSkills, resumeText } = req.body;
  if (!jobDescription) return res.status(400).json({ msg: 'Job description is required' });
  try {
    const analysis = await analyzeJD(jobDescription, userSkills || '', resumeText || '');
    res.json(analysis);
  } catch (err) {
    console.error('AI ERROR:', err.message);
    res.status(500).json({ msg: 'AI analysis failed', error: err.message });
  }
};

exports.coverLetter = async (req, res) => {
  const { jobDescription, userSkills, userName, company, role } = req.body;
  if (!jobDescription) return res.status(400).json({ msg: 'Job description is required' });
  try {
    const letter = await generateCoverLetter(jobDescription, userSkills, userName, company, role);
    res.json({ coverLetter: letter });
  } catch (err) {
    console.error('Cover Letter ERROR:', err.message);
    res.status(500).json({ msg: 'Cover letter generation failed', error: err.message });
  }
};

exports.interviewPrep = async (req, res) => {
  const { jobDescription, userSkills, role } = req.body;
  if (!jobDescription) return res.status(400).json({ msg: 'Job description is required' });
  try {
    const questions = await generateInterviewQuestions(jobDescription, userSkills, role);
    res.json({ questions });
  } catch (err) {
    console.error('Interview Prep ERROR:', err.message);
    res.status(500).json({ msg: 'Interview prep failed', error: err.message });
  }
};