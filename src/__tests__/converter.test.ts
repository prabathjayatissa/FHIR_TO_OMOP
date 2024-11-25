import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { FhirToOmopConverter } from '../converter.js';
import { setupDatabase } from '../database.js';
import type { Database } from 'sql.js';

describe('FhirToOmopConverter', () => {
  let db: Database;
  let converter: FhirToOmopConverter;

  beforeEach(async () => {
    db = await setupDatabase();
    converter = new FhirToOmopConverter(db);
  });

  afterEach(async () => {
    db.close();
  });

  test('converts FHIR bundle to OMOP', async () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      entry: [{
        resource: {
          resourceType: 'Patient',
          id: '12345',
          gender: 'female',
          birthDate: '1970-01-01'
        }
      }]
    };
    
    const result = await converter.convertBundle(fhirBundle);
    
    expect(result).toHaveProperty('person');
    expect(result.person).toEqual({
      person_id: 12345,
      gender_concept_id: 8532,
      year_of_birth: 1970,
      month_of_birth: 1,
      day_of_birth: 1,
      person_source_value: '12345',
      gender_source_value: 'female'
    });
  });

  test('handles invalid FHIR data', async () => {
    const invalidBundle = {
      resourceType: 'Bundle',
      entry: [{
        resource: {
          resourceType: 'Patient',
          id: '12345',
          gender: 'invalid'
        }
      }]
    };
    
    await expect(converter.convertBundle(invalidBundle))
      .rejects
      .toThrow();
  });
});