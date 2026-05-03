// server/migrate.js
// Run this ONCE from your server folder:
//   node migrate.js
//
// It safely adds the 3 missing columns to your existing demands table.
// SQLite's ALTER TABLE only supports ADD COLUMN — it won't touch existing data.

const db = require('./services/db');

const migrations = [
  `ALTER TABLE demands ADD COLUMN reuse_recommendation TEXT DEFAULT ''`,
  `ALTER TABLE demands ADD COLUMN rebalance_needed INTEGER DEFAULT 0`,
  `ALTER TABLE demands ADD COLUMN rebalance_suggestion TEXT DEFAULT ''`,
];

migrations.forEach(sql => {
  try {
    db.prepare(sql).run();
    const col = sql.match(/ADD COLUMN (\w+)/)[1];
    console.log(`✅ Added column: ${col}`);
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      const col = sql.match(/ADD COLUMN (\w+)/)[1];
      console.log(`⏭  Column already exists, skipping: ${col}`);
    } else {
      console.error(`❌ Migration failed:`, err.message);
    }
  }
});

console.log('\n✅ Migration complete. You can now restart your server.');
