import { setupDatabase } from './database.js';
import { FhirToOmopConverter } from './converter.js';
import { sampleFhirData } from './sample-data.js';

async function main() {
  let db;
  try {
    // Initialize database and tables
    db = await setupDatabase();
    console.log('Database initialized successfully');
    
    // Create converter instance
    const converter = new FhirToOmopConverter(db);
    
    // Convert sample FHIR data to OMOP
    console.log('Converting FHIR data...');
    const result = await converter.convertBundle(sampleFhirData);
    console.log('Successfully converted FHIR to OMOP CDM:', result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
      console.log('Database connection closed');
    }
  }
}

main().catch(console.error);