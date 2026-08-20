import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import 'dotenv/config'

import { getDatabaseSslConfig } from './ssl'

// This script is used to run migrations on the database
// Run it with: bun run lib/db/migrate.ts

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL

  const sql = postgres(connectionString, {
    ssl: getDatabaseSslConfig(),
    prepare: false
  })

  const db = drizzle(sql)

  console.log('Running migrations...')

  try {
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  await sql.end()
  process.exit(0)
}

runMigrations()
