export function parseBirthDate(birthDate?: string) {
  if (!birthDate) return { year: null, month: null, day: null };
  
  const date = new Date(birthDate);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}