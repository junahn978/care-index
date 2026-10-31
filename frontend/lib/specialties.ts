// offered in the Specialty dropdown, in this order, before any custom ones
export const DEFAULT_SPECIALTIES = [
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Geriatrics",
  "Cardiology",
  "Gastroenterology",
  "Endocrinology",
  "Pulmonology",
  "Nephrology",
  "Rheumatology",
  "Oncology",
  "Hematology",
  "Infectious Disease",
  "General Surgery",
  "Orthopedic Surgery",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "Urology",
  "Plastic & Reconstructive Surgery",
  "Dermatology",
  "Neurology",
  "Ophthalmology",
  "Otolaryngology (ENT)",
  "Obstetrics & Gynecology (OB/GYN)",
  "Emergency Medicine",
  "Anesthesiology",
  "Radiology",
  "Pathology",
  "Psychiatry",
  "Physical Medicine & Rehabilitation",
];

// "cardiology" and "Cardiology " are the same specialty
export function isSameSpecialty(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
