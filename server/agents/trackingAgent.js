const { callClaude } = require('../services/claudeService');
const SYSTEM = `You are a TCS execution tracking engine.
Predict timeline risks and generate alert messages. Return ONLY JSON:
{
 "predicted_end_date": "YYYY-MM-DD",
 "risk_flag": "GREEN | AMBER | RED",
 "risk_reason": "string",
 "alert_email": "string — draft alert email body if risk is AMBER or RED"
}`
async function runTrackingAgent(demand, decision, resource) {
 const startDate = new Date().toISOString().split('T')[0];
 const userMsg = JSON.stringify({
 start_date: startDate,
 sla_days: decision.sla_days,
 route: decision.route,
 rebalance_needed: resource.rebalance_needed,
 team_size: resource.team ? resource.team.length : 0
 });
 const raw = await callClaude(SYSTEM, userMsg);
 try { const cleaned = raw.replace(/```json|```/gi, '').trim();
return JSON.parse(cleaned); }
 catch { return { predicted_end_date: 'TBD', risk_flag: 'GREEN', risk_reason: 'Tracking initialised.', alert_email: '' }; }
}
module.exports = { runTrackingAgent };