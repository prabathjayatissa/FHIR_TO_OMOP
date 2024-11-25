import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

export async function setupDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();

  // Create OMOP CDM person table
  db.run(`
    CREATE TABLE IF NOT EXISTS person (
      person_id INTEGER PRIMARY KEY,
      gender_concept_id INTEGER,
      year_of_birth INTEGER,
      month_of_birth INTEGER,
      day_of_birth INTEGER,
      birth_datetime TEXT,
      race_concept_id INTEGER,
      ethnicity_concept_id INTEGER,
      person_source_value TEXT,
      gender_source_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}