export type AtsScoreBand = "poor" | "fair" | "good" | "excellent";

export type AtsScoreResult = {
  overall: number;
  format: number;
  content: number;
  keywords: number;
  length: number;
  issues: string[];
  suggestions: string[];
  jdKeywordMatchPct?: number;
  jdTopKeywords?: string[];
};

export const SCORE_BANDS = [
  [0, 59, "poor", "Needs major work"],
  [60, 74, "fair", "Below ATS-friendly"],
  [75, 84, "good", "ATS-friendly"],
  [85, 100, "excellent", "Top-tier ATS-optimised"],
] as const;

const colors: Record<AtsScoreBand, "danger" | "warning" | "success" | "primary"> = {
  poor: "danger",
  fair: "warning",
  good: "success",
  excellent: "primary",
};

const stopWords = new Set([
  "a",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "role",
  "team",
  "company",
  "candidate",
  "required",
  "preferred",
]);

export function interpretScore(overall: number) {
  const band = SCORE_BANDS.find(([low, high]) => overall >= low && overall <= high);
  const key = (band?.[2] ?? (overall < 0 ? "poor" : "excellent")) as AtsScoreBand;
  return {
    band: key,
    label: band?.[3] ?? SCORE_BANDS.at(overall < 0 ? 0 : -1)?.[3] ?? "",
    color: colors[key],
  };
}

export function extractJdKeywords(jobDescription: string, topK = 25) {
  const tokens = Array.from(jobDescription.toLowerCase().matchAll(/[a-z][a-z0-9.+#-]{1,}/g))
    .map((match) => match[0].replace(/\.$/, ""))
    .filter((token) => token && !stopWords.has(token));

  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  for (let index = 0; index < tokens.length - 1; index += 1) {
    const bigram = `${tokens[index]} ${tokens[index + 1]}`;
    counts.set(bigram, (counts.get(bigram) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([left, leftCount], [right, rightCount]) => {
      if (rightCount !== leftCount) return rightCount - leftCount;
      const leftSpaces = (left.match(/ /g) ?? []).length;
      const rightSpaces = (right.match(/ /g) ?? []).length;
      if (leftSpaces !== rightSpaces) return leftSpaces - rightSpaces;
      return left.localeCompare(right);
    })
    .slice(0, topK)
    .map(([keyword]) => keyword);
}

export function scoreResumeText(_text: string, _jobDescription = ""): AtsScoreResult {
  void _text;
  void _jobDescription;
  throw new Error("TODO: port Django ATSScorer static path and Gemini-augmented path in Phase 3.");
}
