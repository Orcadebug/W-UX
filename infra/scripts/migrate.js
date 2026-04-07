const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const migrationsDir = path.join(__dirname, '../migrations')
  const files = fs.readdirSync(migrationsDir).sort()
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY)')
  for (const file of files) {
    const version = file.split('_')[0]
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version])
    if (rows.length === 0) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await pool.query(sql)
      await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version])
    }
  }
  console.log('Migrations complete')
  await pool.end()
}
migrate().catch(console.error)
