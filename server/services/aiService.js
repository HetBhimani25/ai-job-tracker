const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeJD = async (jobDescription, userSkills) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are a career coach AI. Analyze the following job description and give structured feedback.

Job Description:
${jobDescription}

Candidate's Current Skills:
${userSkills}

Respond in this exact JSON format:
{
  "matchScore": <number 0-100>,
  "strongMatches": [<list of skills candidate already has that match>],
  "skillGaps": [<list of skills missing that JD requires>],
  "resumeTips": [<3-4 specific resume improvement suggestions>],
  "summary": "<2 sentence overall assessment>"
}
Only return valid JSON, no extra text.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

module.exports = { analyzeJD };