export const GENDER_CONCEPTS = {
  male: 8507,    // OMOP concept ID for Male
  female: 8532,  // OMOP concept ID for Female
  other: 8551,   // OMOP concept ID for Other
  unknown: 0     // Unknown
} as const;

export function mapGenderToConceptId(gender: string): number {
  return GENDER_CONCEPTS[gender as keyof typeof GENDER_CONCEPTS] || 0;
}