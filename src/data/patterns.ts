export type PatternSummary = {
  slug: string;
  title: string;
  category: string;
  width: number;
  height: number;
  difficulty: "beginner" | "easy" | "medium" | "hard";
};

export const patterns: PatternSummary[] = [];

