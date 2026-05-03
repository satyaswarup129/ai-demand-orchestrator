const { callClaude } = require('../services/claudeService');
const SYSTEM = 'You are a TCS demand routing engine. Given a classified demand, decide the best fulfilment path. Return ONLY valid JSON with fields: route (POC|MVP|PROJECT|HACKATHON|PARTNER), reason (2-3 sentences), recommended_manager, sla_days (number), asset_first (bool), governance_flags (array).';
async function runDecisionAgent(demand, classification) {
 const userMsg = JSON.stringify({ ...demand, ...classification });
 const raw = await callClaude(SYSTEM, userMsg);
 try { const cleaned = raw.replace(/```json|```/gi, '').trim();
    return JSON.parse(cleaned); }
 catch { return { route: 'POC', reason: 'Default routing applied.', recommended_manager:
'BEST_AVAILABLE', sla_days: 30, asset_first: true, governance_flags: [] }; }
}
module.exports = { runDecisionAgent };
