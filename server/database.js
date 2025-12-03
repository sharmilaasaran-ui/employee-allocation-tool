const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    // Employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        hourly_rate REAL NOT NULL DEFAULT 0,
        email TEXT UNIQUE,
        password TEXT
      )
    `);

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);

    // Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )
    `);

    // Allocations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS allocations (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        allocated_hours REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'Not Yet Started',
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      )
    `);

    // Migration: Add status column if it doesn't exist (for existing databases)
    try {
      await client.query(`ALTER TABLE allocations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Not Yet Started'`);
    } catch (e) {
      console.log('Status column migration check completed.');
    }

    // Migration: Add email and password columns to employees if they don't exist
    try {
      await client.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT UNIQUE`);
      await client.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS password TEXT`);
    } catch (e) {
      console.log('Employee columns migration check completed.');
    }

    // Time Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_logs (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      )
    `);

    // Admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT
      )
    `);

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDatabase };
