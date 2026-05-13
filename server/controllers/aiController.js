const { analyzeJD } = require('../services/aiService');

exports.analyzeJob = async (req, res) => {
  const { jobDescription, userSkills } = req.body;
  if (!jobDescription) return res.status(400).json({ msg: 'Job description is required' });

  try {
    const analysis = await analyzeJD(jobDescription, userSkills || '');
    res.json(analysis);
  } catch (err) {
    console.error('AI ERROR:', err.message);  // ADD THIS
    res.status(500).json({ msg: 'AI analysis failed', error: err.message }); 
  }
};