import { z } from 'zod';

export const PersonSchema = z.object({
  person_id: z.number(),
  gender_concept_id: z.number(),
  year_of_birth: z.number().nullable(),
  month_of_birth: z.number().nullable(),
  day_of_birth: z.number().nullable(),
  person_source_value: z.string(),
  gender_source_value: z.string()
});

export type Person = z.infer<typeof PersonSchema>;