export type Step = 0 | 1 | 2 | 3 | 4 | 5;
export type Gender = "male" | "female" | null;
export type RecommendedTier = "basic" | "standard" | "premium";

export interface PetInfo {
  name: string;
  birthDate: Date | null;
  weight: string;
  gender: Gender;
}

export interface Answers {
  allergies: string[];
  healthCare: string[];
  snack: string[];
  texture: string[];
}

export function mockRecommend(answers: Answers): RecommendedTier {
  const specialCare = answers.healthCare.filter((h) =>
    ["관절강화", "다이어트"].includes(h)
  ).length;
  const score = answers.allergies.length + specialCare;
  if (score >= 2) return "premium";
  if (score >= 1) return "standard";
  return "basic";
}
