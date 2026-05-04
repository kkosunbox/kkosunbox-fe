export type Gender = "male" | "female" | null;
export type RecommendedTier = "basic" | "standard" | "premium";

export interface PetInfo {
  name: string;
  breed: string;
  specialNotes: string;
  birthDate: Date | null;
  weight: string;
  gender: Gender;
}
