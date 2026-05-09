export type AtsScoreBand = "poor" | "fair" | "good" | "excellent";

export type AtsScoreResult = {
  overall: number;
  format: number;
  content: number;
  keywords: number;
  length: number;
  issues: string[];
  suggestions: string[];
  breakdown: {
    format: { score: number; max: 25 };
    content: { score: number; max: 25 };
    keywords: { score: number; max: 25 };
    length: { score: number; max: 25 };
  };
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

const actionVerbs = [
  "achieved",
  "built",
  "created",
  "delivered",
  "developed",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "optimized",
  "reduced",
  "resolved",
  "shipped",
  "streamlined",
];

const technicalSkills = [
  "accounting",
  "analytics",
  "aws",
  "azure",
  "django",
  "excel",
  "figma",
  "google analytics",
  "javascript",
  "marketing",
  "node.js",
  "postgresql",
  "power bi",
  "python",
  "react",
  "salesforce",
  "seo",
  "sql",
  "supabase",
  "typescript",
];

const softSkills = [
  "communication",
  "collaboration",
  "customer service",
  "leadership",
  "mentoring",
  "negotiation",
  "problem solving",
  "stakeholder management",
  "teamwork",
];

const stopWords = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "role",
  "team",
  "company",
  "candidate",
  "position",
  "requirements",
  "responsibilities",
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

function keywordTokens(text: string) {
  return Array.from(text.toLowerCase().matchAll(/[a-z][a-z0-9.+#-]{1,}/g))
    .map((match) => match[0].replace(/\.$/, ""))
    .filter((token) => token && !stopWords.has(token));
}

export function extractJdKeywords(jobDescription: string, topK = 25) {
  const tokens = keywordTokens(jobDescription);
  const counts = new Map<string, number>();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

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

function containsKeyword(keyword: string, text: string) {
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);
}

function scoreFormat(text: string): [number, string[]] {
  let score = 25;
  const issues: string[] = [];

  if (/[^\x00-\x7F]+/.test(text)) {
    score -= 5;
    issues.push("Contains special characters that may not parse correctly");
  }

  const formattingChars = (text.match(/[●•►▸◆■□]/g) ?? []).length;
  if (formattingChars > 10) {
    score -= 5;
    issues.push("Excessive formatting symbols detected");
  }

  if ((text.match(/\|/g) ?? []).length > 20) {
    score -= 5;
    issues.push("Table formatting detected - may not parse well in ATS");
  }

  return [Math.max(0, score), issues];
}

function scoreContent(text: string): [number, string[]] {
  let score = 0;
  const issues: string[] = [];

  if (/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/.test(text)) {
    score += 5;
  } else {
    issues.push("No email address found");
  }

  if (/(?:\+94|0)?\s?\d{2}[\s-]?\d{3}[\s-]?\d{4}|\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(text)) {
    score += 5;
  } else {
    issues.push("No phone number found");
  }

  const sections = [
    ["experience", /(work experience|experience|work history|employment)/],
    ["education", /(education|academic|degree)/],
    ["skills", /(skills|competencies|expertise)/],
  ] as const;

  for (const [name, pattern] of sections) {
    if (pattern.test(text)) {
      score += 5;
    } else {
      issues.push(`Missing '${name[0].toUpperCase()}${name.slice(1)}' section`);
    }
  }

  return [score, issues];
}

function scoreKeywords(text: string, jobDescription = ""): [number, string[]] {
  const issues: string[] = [];

  if (jobDescription) {
    const jdKeywords = extractJdKeywords(jobDescription);

    if (jdKeywords.length > 5) {
      const found = jdKeywords.filter((keyword) => text.includes(keyword)).length;
      const matchPct = found / jdKeywords.length;

      if (matchPct < 0.4) {
        issues.push("Your resume has a very low keyword match with the provided job description.");
      } else if (matchPct < 0.7) {
        issues.push("Missing several keywords specific to the job description.");
      }

      return [Math.min(25, Math.floor(matchPct * 25)), issues];
    }
  }

  const actionVerbCount = actionVerbs.filter((verb) => containsKeyword(verb, text)).length;
  const techSkillCount = technicalSkills.filter((skill) => containsKeyword(skill, text)).length;
  const softSkillCount = softSkills.filter((skill) => containsKeyword(skill, text)).length;
  let score = Math.min(10, actionVerbCount * 2);
  score += Math.min(10, techSkillCount * 2);
  score += Math.min(5, softSkillCount);

  if (actionVerbCount < 3) {
    issues.push("Use more action verbs such as achieved, managed, or developed");
  }

  if (techSkillCount === 0 && softSkillCount === 0) {
    issues.push("Add relevant technical and soft skills");
  }

  return [score, issues];
}

function scoreLength(text: string): [number, string[]] {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount >= 400 && wordCount <= 800) return [25, []];
  if (wordCount >= 300 && wordCount < 400) return [20, ["Resume is a bit short - consider adding more detail"]];
  if (wordCount > 800 && wordCount <= 1000) return [20, ["Resume is slightly long - consider being more concise"]];
  if (wordCount > 1000) return [10, ["Resume is too long - aim for 1-2 pages"]];

  return [5, ["Resume is too short - add more content"]];
}

function suggestionsFromIssues(issues: string[]) {
  const suggestions = new Set<string>();
  const map = [
    ["email", "Add a professional email address in the header"],
    ["phone", "Include your phone number for contact purposes"],
    ["action verbs", "Use strong action verbs to describe your achievements"],
    ["skills", "Add a dedicated skills section with relevant keywords"],
    ["experience", "Include a professional experience or work history section"],
    ["education", "Add your education details including degree and institution"],
    ["special characters", "Remove special characters and use simple formatting"],
    ["long", "Condense content to fit 1-2 pages for better readability"],
    ["keyword", "Mirror important job-description keywords honestly in your resume"],
  ] as const;

  for (const issue of issues) {
    const lower = issue.toLowerCase();
    const match = map.find(([key]) => lower.includes(key));
    if (match) suggestions.add(match[1]);
  }

  return [...suggestions].slice(0, 5);
}

function jdKeywordMatch(text: string, jobDescription: string) {
  const keywords = extractJdKeywords(jobDescription);
  if (keywords.length === 0) {
    return { jdKeywordMatchPct: 0, jdTopKeywords: [] };
  }

  const resumeTokenList = keywordTokens(text);
  const resumeTokens = new Set(resumeTokenList);
  const resumeBigrams = new Set(resumeTokenList.slice(0, -1).map((token, index) => `${token} ${resumeTokenList[index + 1]}`));
  const lowerText = text.toLowerCase();
  const matched = keywords.filter((keyword) =>
    keyword.includes(" ") ? resumeBigrams.has(keyword) || lowerText.includes(keyword) : resumeTokens.has(keyword)
  ).length;

  return {
    jdKeywordMatchPct: Math.round((matched / keywords.length) * 100),
    jdTopKeywords: keywords,
  };
}

export function scoreResumeText(text: string, jobDescription = ""): AtsScoreResult {
  const lower = text.toLowerCase();
  const [format, formatIssues] = scoreFormat(text);
  const [content, contentIssues] = scoreContent(lower);
  const [keywords, keywordIssues] = scoreKeywords(lower, jobDescription.toLowerCase());
  const [length, lengthIssues] = scoreLength(text);
  const issues = [...formatIssues, ...contentIssues, ...keywordIssues, ...lengthIssues];
  const result: AtsScoreResult = {
    overall: format + content + keywords + length,
    format,
    content,
    keywords,
    length,
    issues,
    suggestions: suggestionsFromIssues(issues),
    breakdown: {
      format: { score: format, max: 25 },
      content: { score: content, max: 25 },
      keywords: { score: keywords, max: 25 },
      length: { score: length, max: 25 },
    },
  };

  if (jobDescription.trim()) {
    Object.assign(result, jdKeywordMatch(text, jobDescription));
  }

  return result;
}
