// server/agents/resourceAgent.js
const { callClaude } = require('../services/claudeService');

// Dummy talent pool — replace with real HR data integration
const TALENT_POOL = [
  { name: 'Priya Sharma',  skills: ['GenAI', 'LLM', 'Python'],               band: 'C2', load: 0.3 },
  { name: 'Arjun Mehta',   skills: ['Data Engineering', 'Spark', 'SQL'],      band: 'C1', load: 0.6 },
  { name: 'Sneha Rao',     skills: ['Cloud', 'Azure', 'DevOps'],              band: 'C2', load: 0.4 },
  { name: 'Rohit Das',     skills: ['QA', 'Automation', 'Python'],            band: 'B2', load: 0.2 },
  { name: 'Meera Pillai',  skills: ['GenAI', 'NLP', 'Fine-Tuning'],           band: 'C3', load: 0.5 },
  { name: 'Karan Joshi',   skills: ['Cybersecurity', 'SIEM', 'SOC'],         band: 'C1', load: 0.7 },
];

const SYSTEM = `You are a TCS resource allocation engine.

RULES — follow strictly:
1. You will receive a list of available_talent with their EXACT skills. Use ONLY those names and skills — do not invent people or roles.
2. The "role" field in your output must be one of the person's actual skills from the talent pool, not a made-up job title.
3. fit_score = percentage of required_skills that the person's skills cover. If they cover 2 of 4 skills, fit_score = 50.
4. Only include people whose skills overlap with at least one required skill.
5. Set rebalance_needed to true if any required skill has ZERO matching people in the talent pool.
6. rebalance_suggestion must name the specific missing skills if rebalance_needed is true.

Return ONLY valid JSON, no preamble:
{
  "team": [
    { "name": "exact name from talent pool", "role": "their matching skill", "fit_score": 0-100 }
  ],
  "team_rationale": "brief explanation of selection",
  "rebalance_needed": true or false,
  "rebalance_suggestion": "list missing skills or empty string"
}`;

async function runResourceAgent(demand, classification, decision) {
  const userMsg = JSON.stringify({
    required_skills: classification.required_skills,
    route:           decision.route,
    sla_days:        decision.sla_days,
    available_talent: TALENT_POOL
  });

  const raw = await callClaude(SYSTEM, userMsg);

  try {
    const cleaned = raw.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      team:                [],
      team_rationale:      'Manual review needed — agent parse error.',
      rebalance_needed:    false,
      rebalance_suggestion: ''
    };
  }
}

module.exports = { runResourceAgent };