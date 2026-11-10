export const GRADES = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
] as const;

export type GradeType = typeof GRADES[number];

export const CATEGORIES = [
  {
    name: "Notebook",
    slug: "notebook",
    description: "Class lecture notes, regular copies, and handwritten lesson logs.",
    icon: "BookOpen",
  },
  {
    name: "Worksheet",
    slug: "worksheet",
    description: "Practice problems, exercise sheets, revision tasks, and assignments.",
    icon: "FileSpreadsheet",
  },
  {
    name: "Handwritten Notes",
    slug: "handwritten-notes",
    description: "Authentic student-authored neat handwritten revision notebooks.",
    icon: "PenTool",
  },
  {
    name: "AI Notes",
    slug: "ai-notes",
    description: "Structured chapter summaries, mindmaps, and AI-assisted revision charts.",
    icon: "Sparkles",
  },
  {
    name: "Q&A",
    slug: "qa",
    description: "Previous exam questions, textbook solutions, sample papers, and answers.",
    icon: "HelpCircle",
  },
] as const;

export type CategoryType = typeof CATEGORIES[number]["name"];

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "Social Studies",
  "English",
  "Hindi",
  "Computer Science",
  "Sanskrit",
  "Environmental Studies",
] as const;

export type SubjectType = typeof SUBJECTS[number];

export const ANNOUNCEMENT_DURATIONS = [
  { label: "1 hour", value: "1_HOUR", hours: 1 },
  { label: "12 hours", value: "12_HOURS", hours: 12 },
  { label: "24 hours", value: "24_HOURS", hours: 24 },
  { label: "7 days", value: "7_DAYS", hours: 24 * 7 },
  { label: "30 days", value: "30_DAYS", hours: 24 * 30 },
  { label: "Forever", value: "FOREVER", hours: null },
] as const;

