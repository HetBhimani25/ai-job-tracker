const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeJD = async (jobDescription, userSkills, resumeText = '') => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: 'You are a career coach AI. Always respond with valid JSON only, no extra text or markdown.' },
      { role: 'user', content: `Analyze the following job description against the candidate's details.
${resumeText ? `Full Resume Content: ${resumeText}` : `Candidate Current Skills: ${userSkills}`}

Job Description: ${jobDescription}

Respond in this exact JSON format:
{
  "matchScore": <number 0-100>,
  "strongMatches": [<skills candidate has that match>],
  "skillGaps": [<skills missing>],
  "resumeTips": [<3-4 resume improvement suggestions based on the JD and candidate's current resume/skills>],
  "summary": "<2 sentence assessment>"
}` }
    ]
  });
  const text = completion.choices[0].message.content;
  return JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim());
};

const generateCoverLetter = async (jobDescription, userSkills, userName, company, role) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: 'You are an expert cover letter writer. Write professional, personalized cover letters.' },
      { role: 'user', content: `Write a professional cover letter for the following:

Candidate Name: ${userName}
Applying for: ${role} at ${company}
Job Description: ${jobDescription}
Candidate Skills: ${userSkills}

Write a compelling 3-paragraph cover letter. Be specific, professional, and tailored to the role. Return only the cover letter text, no extra commentary.` }
    ]
  });
  return completion.choices[0].message.content.trim();
};

const generateInterviewQuestions = async (jobDescription, userSkills, role) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: 'You are an expert technical interviewer. Always respond with valid JSON only, no extra text or markdown.' },
      { role: 'user', content: `Generate interview questions for this role and candidate.

Role: ${role}
Job Description: ${jobDescription}
Candidate Skills: ${userSkills}

Respond in this exact JSON format:
{
  "technical": [<5 technical questions specific to the JD>],
  "behavioral": [<3 behavioral questions>],
  "tips": [<3 preparation tips for this specific role>]
}` }
    ]
  });
  const text = completion.choices[0].message.content;
  return JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim());
};

module.exports = { analyzeJD, generateCoverLetter, generateInterviewQuestions };

const extractSkillsFromResume = async (resumeText) => {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 512,
    messages: [
      { role: 'system', content: 'You are a resume parser. Always respond with valid JSON only.' },
      { role: 'user', content: `Extract all technical and soft skills from this resume.

Resume:
${resumeText}

Return ONLY this JSON format:
{
  "skills": "<comma separated list of all skills found>",
  "name": "<candidate full name if found>",
  "summary": "<2 sentence professional summary>"
}` }
    ]
  });
  const text = completion.choices[0].message.content;
  return JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim());
};

module.exports = { analyzeJD, generateCoverLetter, generateInterviewQuestions, extractSkillsFromResume };