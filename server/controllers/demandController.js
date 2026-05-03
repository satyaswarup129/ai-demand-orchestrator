// server/controllers/demandController.js
const { randomUUID } = require('crypto');
const db = require('../services/db');
const { runIntakeAgent }      = require('../agents/intakeAgent');
const { runDecisionAgent }    = require('../agents/decisionAgent');
const { runResourceAgent }    = require('../agents/resourceAgent');
const { runTrackingAgent }    = require('../agents/trackingAgent');
const { sendAssignmentEmail } = require('../services/emailService'); // ← single import only

// ── POST /api/demand/submit ────────────────────────────────────────────────
exports.submitDemand = async (req, res) => {
  try {
    const demand = { id: randomUUID(), ...req.body };

    // Stage 1: Classify
    const classification = await runIntakeAgent(demand);
    // Stage 2: Route
    const decision       = await runDecisionAgent(demand, classification);
    // Stage 3: Compose team
    const resource       = await runResourceAgent(demand, classification, decision);
    // Stage 4: Track
    const tracking       = await runTrackingAgent(demand, decision, resource);

    // Persist — includes reuse_recommendation, rebalance_needed, rebalance_suggestion
    const stmt = db.prepare(
      'INSERT INTO demands ' +
      '(id,title,description,submitter,bu,domain,priority,complexity,' +
      'required_skills,route,route_reason,manager,team,stage,sla_days,' +
      'predicted_end,risk_flag,reuse_recommendation,rebalance_needed,rebalance_suggestion) ' +
      'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );

    stmt.run(
      demand.id, demand.title, demand.description, demand.submitter, demand.bu,
      classification.domain, classification.priority, classification.complexity,
      JSON.stringify(classification.required_skills),
      decision.route, decision.reason, decision.recommended_manager,
      JSON.stringify(resource.team), 'CLASSIFIED',
      decision.sla_days, tracking.predicted_end_date, tracking.risk_flag,
      classification.reuse_recommendation || '',
      resource.rebalance_needed ? 1 : 0,
      resource.rebalance_suggestion      || ''
    );

    res.json({ success: true, demand_id: demand.id, classification, decision, resource, tracking });
  } catch (err) {
    console.error('submitDemand error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/demand ────────────────────────────────────────────────────────
exports.getDemands = (req, res) => {
  const rows = db.prepare('SELECT * FROM demands ORDER BY created_at DESC').all();
  res.json(rows);
};

// ── GET /api/demand/:id ────────────────────────────────────────────────────
exports.getDemandById = (req, res) => {
  const row = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  row ? res.json(row) : res.status(404).json({ error: 'Not found' });
};

// ── PATCH /api/demand/:id/stage ────────────────────────────────────────────
exports.updateStage = (req, res) => {
  try {
    const { stage } = req.body;
    const id        = req.params.id;

    db.prepare(`
      UPDATE demands SET stage = ?, updated_at = datetime('now') WHERE id = ?
    `).run(stage, id);

    // Fire automation only when moving to ASSIGNED
    if (stage === 'ASSIGNED') {
      const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(id);
      let team = [];
      try { team = JSON.parse(demand.team || '[]'); } catch { /* empty */ }

      // DEMO LOG — visible in terminal for judges
      console.log(`📧 [AUTO] Assignment email triggered for: "${demand.title}"`);
      console.log(`👨‍💻 Team Assigned: ${team.map(t => t.name).join(', ')}`);

      sendAssignmentEmail({
        to:          team.map(m => m.email || process.env.EMAIL_USER).join(','),
        demandTitle: demand.title,
        route:       demand.route,
        manager:     demand.manager,
        sla_days:    demand.sla_days,
        team
      }).catch(err => console.error('Email error:', err.message));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('updateStage error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE /api/demand/:id ─────────────────────────────────────────────────
exports.deleteDemand = (req, res) => {
  try {
    db.prepare('DELETE FROM demands WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};