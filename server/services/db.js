const Database = require('better-sqlite3');
const db = new Database('./data/orchestrator.db');
// const db = new Database('./server/data/orchestrator.db');
db.exec(`
 CREATE TABLE IF NOT EXISTS demands (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 description TEXT,
 submitter TEXT,
 bu TEXT,
 domain TEXT,
 priority TEXT,
 complexity TEXT,
 required_skills TEXT,
 route TEXT,
 route_reason TEXT,
 manager TEXT,
 team TEXT,
 stage TEXT DEFAULT 'INTAKE',
 sla_days INTEGER,
 predicted_end TEXT,
 risk_flag TEXT,
 reuse_recommendation TEXT,
 rebalance_needed INTEGER DEFAULT 0,
 rebalance_suggestion TEXT,
 created_at TEXT DEFAULT (datetime('now')),
 updated_at TEXT DEFAULT (datetime('now'))
 );
`);
module.exports = db;
