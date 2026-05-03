const { callClaude } = require('../services/claudeService');
const SYSTEM = `You are an AI demand classifier for TCS.
Analyze the demand and return ONLY valid JSON with these fields:
{
 "domain": "string (e.g. GenAI, Data Engineering, Cloud, QA, Cybersecurity)",
 "priority": "HIGH | MEDIUM | LOW",
 "complexity": "SIMPLE | MODERATE | COMPLEX",
 "required_skills": ["skill1","skill2"],
 "is_quick_win": true or false,
 "reuse_recommendation": "string — recommend any existing TCS asset or accelerator"
}
Return ONLY the JSON. No preamble.`;
async function runIntakeAgent(demand) {
 const userMsg = `Title: ${demand.title}\nDescription: ${demand.description}\nBU: $
{demand.bu}`;
 const raw = await callClaude(SYSTEM, userMsg);
 try { const cleaned = raw.replace(/```json|```/gi, '').trim();
return JSON.parse(cleaned); }
 catch { return { domain: 'GenAI', priority: 'MEDIUM', complexity: 'MODERATE',
required_skills: [], is_quick_win: false, reuse_recommendation: 'None identified' }; }
}
module.exports = { runIntakeAgent };
