import type { Database } from 'sql.js';
import { 
  FhirBundleSchema,
  type FhirPatient,
  type FhirCondition,
  type FhirObservation,
  type FhirProcedure,
  type FhirMedicationRequest,
  type FhirMedicationDispense,
  type FhirEncounter,
  type FhirDiagnosticReport
} from './models/fhir.js';
import { type Person } from './models/person.js';
import { mapGenderToConceptId } from './utils/concepts.js';
import { parseBirthDate } from './utils/date.js';

export class FhirToOmopConverter {
  constructor(private db: Database) {}


  async convertBundle(fhirBundle: unknown) {
    const bundle = FhirBundleSchema.parse(fhirBundle);
    const results: Record<string, any> = {};
    
    for (const entry of bundle.entry) {
      const resource = entry.resource;
      
      switch (resource.resourceType) {
        case 'Patient':
          if (!results.person) {
            results.person = await this.convertPatient(resource);
          }
          break;
        case 'Condition':
          if (!results.condition) {
            results.condition = [];
          }
          results.condition.push(await this.convertCondition(resource));
          break;
        case 'Observation':
          if (!results.measurement) {
            results.measurement = [];
          }
          results.measurement.push(await this.convertObservation(resource));
          break;
        case 'Procedure':
          if (!results.procedure) {
            results.procedure = [];
          }
          results.procedure.push(await this.convertProcedure(resource));
          break;
        case 'MedicationRequest':
        case 'MedicationDispense':
          if (!results.drug_exposure) {
            results.drug_exposure = [];
          }
          results.drug_exposure.push(
            resource.resourceType === 'MedicationRequest' 
              ? await this.convertMedicationRequest(resource)
              : await this.convertMedicationDispense(resource)
          );
          break;
        case 'Encounter':
          if (!results.visit_occurrence) {
            results.visit_occurrence = [];
          }
          results.visit_occurrence.push(await this.convertEncounter(resource));
          break;
        case 'DiagnosticReport':
          if (!results.note) {
            results.note = [];
          }
          results.note.push(await this.convertDiagnosticReport(resource));
          break;
      }
    }
    
    return results;
  }

  private async convertPatient(patient: FhirPatient): Promise<Person> {
    const birthDate = parseBirthDate(patient.birthDate);
    
    const personData: Person = {
      person_id: parseInt(patient.id, 10),
      gender_concept_id: mapGenderToConceptId(patient.gender),
      year_of_birth: birthDate.year,
      month_of_birth: birthDate.month,
      day_of_birth: birthDate.day,
      person_source_value: patient.id,
      gender_source_value: patient.gender
    };

    this.db.run(`
      INSERT INTO person (
        person_id, gender_concept_id, year_of_birth, 
        month_of_birth, day_of_birth, person_source_value, 
        gender_source_value
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      personData.person_id,
      personData.gender_concept_id,
      personData.year_of_birth,
      personData.month_of_birth,
      personData.day_of_birth,
      personData.person_source_value,
      personData.gender_source_value
    ]);
    
    return personData;
  }

  private async convertCondition(condition: FhirCondition) {
    return {
      condition_occurrence_id: parseInt(condition.id.replace('cond-', ''), 10),
      person_id: parseInt(condition.subject.reference.replace('Patient/', ''), 10),
      condition_concept_id: parseInt(condition.code.coding[0].code),
      condition_start_date: condition.onsetDateTime,
      condition_source_value: condition.code.coding[0].display
    };
  }

  private async convertObservation(observation: FhirObservation) {
    return {
      measurement_id: parseInt(observation.id.replace('obs-', ''), 10),
      person_id: parseInt(observation.subject.reference.replace('Patient/', ''), 10),
      measurement_concept_id: parseInt(observation.code.coding[0].code),
      measurement_date: observation.effectiveDateTime,
      value_as_number: observation.valueQuantity?.value,
      unit_source_value: observation.valueQuantity?.unit,
      measurement_source_value: observation.code.coding[0].display
    };
  }

  private async convertProcedure(procedure: FhirProcedure) {
    return {
      procedure_occurrence_id: parseInt(procedure.id.replace('proc-', ''), 10),
      person_id: parseInt(procedure.subject.reference.replace('Patient/', ''), 10),
      procedure_concept_id: parseInt(procedure.code.coding[0].code),
      procedure_date: procedure.performedDateTime,
      procedure_source_value: procedure.code.coding[0].display
    };
  }

  private async convertMedicationRequest(medicationRequest: FhirMedicationRequest) {
    return {
      drug_exposure_id: parseInt(medicationRequest.id.replace('medreq-', ''), 10),
      person_id: parseInt(medicationRequest.subject.reference.replace('Patient/', ''), 10),
      drug_concept_id: parseInt(medicationRequest.medicationCodeableConcept.coding[0].code),
      drug_exposure_start_date: medicationRequest.authoredOn,
      drug_source_value: medicationRequest.medicationCodeableConcept.coding[0].display
    };
  }

  private async convertMedicationDispense(dispense: FhirMedicationDispense) {
    return {
      drug_exposure_id: parseInt(dispense.id.replace('meddisp-', ''), 10),
      person_id: parseInt(dispense.subject.reference.replace('Patient/', ''), 10),
      drug_concept_id: parseInt(dispense.medicationCodeableConcept.coding[0].code),
      drug_exposure_start_date: dispense.whenHandedOver,
      drug_exposure_end_date: dispense.whenHandedOver,
      quantity: dispense.quantity?.value,
      days_supply: dispense.daysSupply?.value,
      drug_source_value: dispense.medicationCodeableConcept.coding[0].display
    };
  }

  private async convertEncounter(encounter: FhirEncounter) {
    return {
      visit_occurrence_id: parseInt(encounter.id.replace('enc-', ''), 10),
      person_id: parseInt(encounter.subject.reference.replace('Patient/', ''), 10),
      visit_concept_id: encounter.class.code === 'AMB' ? 9202 : 0,
      visit_start_date: encounter.period?.start,
      visit_end_date: encounter.period?.end,
      visit_source_value: encounter.class.display
    };
  }

  private async convertDiagnosticReport(report: FhirDiagnosticReport) {
    return {
      note_id: parseInt(report.id.replace('diagrep-', ''), 10),
      person_id: parseInt(report.subject.reference.replace('Patient/', ''), 10),
      note_date: report.effectiveDateTime,
      note_text: report.conclusion || report.code.coding[0].display,
      note_type_concept_id: 44814637 // Type concept for diagnostic report
    };
  }
}
