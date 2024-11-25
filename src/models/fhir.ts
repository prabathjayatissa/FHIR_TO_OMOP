import { z } from 'zod';

// Common FHIR datatypes
const Identifier = z.object({
  system: z.string().optional(),
  value: z.string().optional()
});

const CodeableConcept = z.object({
  coding: z.array(z.object({
    system: z.string(),
    code: z.string(),
    display: z.string().optional()
  })),
  text: z.string().optional()
});

const Reference = z.object({
  reference: z.string(),
  display: z.string().optional()
});

const Period = z.object({
  start: z.string().optional(),
  end: z.string().optional()
});

const Quantity = z.object({
  value: z.number(),
  unit: z.string(),
  system: z.string().optional(),
  code: z.string().optional()
});

const Annotation = z.object({
  text: z.string()
});

// Patient Schema
export const FhirPatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string(),
  identifier: z.array(Identifier).optional(),
  active: z.boolean().optional(),
  name: z.array(z.object({
    use: z.string().optional(),
    family: z.string().optional(),
    given: z.array(z.string()).optional()
  })).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: z.string().optional(),
  address: z.array(z.object({
    use: z.string().optional(),
    line: z.array(z.string()).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  })).optional()
});

// Condition Schema
export const FhirConditionSchema = z.object({
  resourceType: z.literal('Condition'),
  id: z.string(),
  subject: Reference,
  code: CodeableConcept,
  onsetDateTime: z.string().optional(),
  abatementDateTime: z.string().optional(),
  recordedDate: z.string().optional(),
  clinicalStatus: CodeableConcept.optional(),
  verificationStatus: CodeableConcept.optional()
});

// Observation Schema
export const FhirObservationSchema = z.object({
  resourceType: z.literal('Observation'),
  id: z.string(),
  status: z.string(),
  code: CodeableConcept,
  subject: Reference,
  effectiveDateTime: z.string().optional(),
  valueQuantity: Quantity.optional(),
  valueCodeableConcept: CodeableConcept.optional(),
  interpretation: z.array(CodeableConcept).optional()
});

// Procedure Schema
export const FhirProcedureSchema = z.object({
  resourceType: z.literal('Procedure'),
  id: z.string(),
  status: z.string(),
  code: CodeableConcept,
  subject: Reference,
  performedDateTime: z.string().optional(),
  performedPeriod: Period.optional(),
  note: z.array(Annotation).optional()
});

// MedicationRequest Schema
export const FhirMedicationRequestSchema = z.object({
  resourceType: z.literal('MedicationRequest'),
  id: z.string(),
  status: z.string(),
  intent: z.string(),
  medicationCodeableConcept: CodeableConcept,
  subject: Reference,
  authoredOn: z.string().optional(),
  requester: Reference.optional(),
  dosageInstruction: z.array(z.object({
    text: z.string().optional(),
    timing: z.object({
      repeat: z.object({
        frequency: z.number().optional(),
        period: z.number().optional(),
        periodUnit: z.string().optional()
      }).optional()
    }).optional(),
    route: CodeableConcept.optional(),
    doseAndRate: z.array(z.object({
      doseQuantity: Quantity.optional()
    })).optional()
  })).optional()
});

// MedicationDispense Schema
export const FhirMedicationDispenseSchema = z.object({
  resourceType: z.literal('MedicationDispense'),
  id: z.string(),
  identifier: z.array(Identifier).optional(),
  status: z.enum([
    'preparation', 'in-progress', 'cancelled', 'on-hold', 
    'completed', 'entered-in-error', 'stopped', 'declined', 'unknown'
  ]),
  medicationCodeableConcept: CodeableConcept,
  subject: Reference,
  context: Reference.optional(),
  performer: z.array(z.object({
    actor: Reference
  })).optional(),
  location: Reference.optional(),
  authorizingPrescription: z.array(Reference).optional(),
  type: CodeableConcept.optional(),
  quantity: Quantity.optional(),
  daysSupply: Quantity.optional(),
  whenPrepared: z.string().optional(),
  whenHandedOver: z.string().optional(),
  destination: Reference.optional(),
  receiver: z.array(Reference).optional(),
  note: z.array(Annotation).optional(),
  dosageInstruction: z.array(z.object({
    text: z.string().optional(),
    timing: z.object({
      repeat: z.object({
        frequency: z.number().optional(),
        period: z.number().optional(),
        periodUnit: z.string().optional()
      }).optional()
    }).optional(),
    route: CodeableConcept.optional(),
    doseAndRate: z.array(z.object({
      doseQuantity: Quantity.optional()
    })).optional()
  })).optional()
});

// Encounter Schema
export const FhirEncounterSchema = z.object({
  resourceType: z.literal('Encounter'),
  id: z.string(),
  status: z.string(),
  class: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string().optional()
  }),
  subject: Reference,
  period: Period.optional(),
  type: z.array(CodeableConcept).optional()
});

// AllergyIntolerance Schema
export const FhirAllergyIntoleranceSchema = z.object({
  resourceType: z.literal('AllergyIntolerance'),
  id: z.string(),
  clinicalStatus: CodeableConcept.optional(),
  verificationStatus: CodeableConcept.optional(),
  type: z.string().optional(),
  category: z.array(z.string()).optional(),
  criticality: z.string().optional(),
  code: CodeableConcept,
  patient: Reference,
  onsetDateTime: z.string().optional(),
  recordedDate: z.string().optional(),
  recorder: Reference.optional()
});

// Immunization Schema
export const FhirImmunizationSchema = z.object({
  resourceType: z.literal('Immunization'),
  id: z.string(),
  status: z.string(),
  vaccineCode: CodeableConcept,
  patient: Reference,
  occurrenceDateTime: z.string().optional(),
  primarySource: z.boolean().optional(),
  location: Reference.optional(),
  manufacturer: Reference.optional(),
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  site: CodeableConcept.optional(),
  route: CodeableConcept.optional(),
  doseQuantity: Quantity.optional()
});

// DiagnosticReport Schema
export const FhirDiagnosticReportSchema = z.object({
  resourceType: z.literal('DiagnosticReport'),
  id: z.string(),
  status: z.enum([
    'registered', 'partial', 'preliminary', 'final', 'amended', 
    'corrected', 'appended', 'cancelled', 'entered-in-error', 'unknown'
  ]),
  code: CodeableConcept,
  subject: Reference,
  effectiveDateTime: z.string().optional(),
  issued: z.string().optional(),
  performer: z.array(Reference).optional(),
  result: z.array(Reference).optional(),
  conclusion: z.string().optional(),
  conclusionCode: z.array(CodeableConcept).optional()
});

// Bundle Schema
export const FhirBundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  id: z.string().optional(),
  type: z.string().optional(),
  entry: z.array(z.object({
    fullUrl: z.string().optional(),
    resource: z.union([
      FhirPatientSchema,
      FhirConditionSchema,
      FhirObservationSchema,
      FhirProcedureSchema,
      FhirMedicationRequestSchema,
      FhirEncounterSchema,
      FhirAllergyIntoleranceSchema,
      FhirImmunizationSchema,
      FhirDiagnosticReportSchema,
      FhirMedicationDispenseSchema
    ])
  })).min(1)
});


// Type exports
export type FhirPatient = z.infer<typeof FhirPatientSchema>;
export type FhirCondition = z.infer<typeof FhirConditionSchema>;
export type FhirObservation = z.infer<typeof FhirObservationSchema>;
export type FhirProcedure = z.infer<typeof FhirProcedureSchema>;
export type FhirMedicationRequest = z.infer<typeof FhirMedicationRequestSchema>;
export type FhirMedicationDispense = z.infer<typeof FhirMedicationDispenseSchema>;
export type FhirEncounter = z.infer<typeof FhirEncounterSchema>;
export type FhirAllergyIntolerance = z.infer<typeof FhirAllergyIntoleranceSchema>;
export type FhirImmunization = z.infer<typeof FhirImmunizationSchema>;
export type FhirDiagnosticReport = z.infer<typeof FhirDiagnosticReportSchema>;
export type FhirBundle = z.infer<typeof FhirBundleSchema>;
