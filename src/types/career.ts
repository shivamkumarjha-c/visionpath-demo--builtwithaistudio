export type ProficiencyLevel = 0 | 1 | 2 | 3 | 4;

export type RadarDimension =
  | "Algorithms & Problem Solving"
  | "Core Language & Runtime"
  | "System Architecture & APIs"
  | "Data & Storage Engineering"
  | "Testing, CI/CD & Observability"
  | "Domain Specialization";

export interface RoleSkill {
  id: string;
  name: string;
  dimension: RadarDimension;
  requiredLevel: ProficiencyLevel;
  weight: 1 | 2 | 3; // 3 = Core Mandatory, 2 = High Signal, 1 = Bonus/Differentiator
  benchmarkCriteria: string;
  bridgeDeliverable: string;
}

export interface TargetRole {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  avgCtcRange: string;
  internStipendRange: string;
  summary: string;
  hiringBarNotes: string;
  skills: RoleSkill[];
}

export interface StudentProject {
  id: string;
  title: string;
  summary: string;
  techStack: string[];
  measurableImpact: string;
  repoUrl?: string;
  complexity: "Academic Lab" | "Full-Stack / Working Prototype" | "Production / Benchmarked System";
  demonstratedSkillIds: string[];
}

export interface StudentProfile {
  name: string;
  branch: string;
  semester: string;
  cgpa: string;
  opportunityType: "Summer Internship (Pre-Final Year)" | "Full-Time Campus Placement + 6M Intern" | "Off-Campus High-Growth Role";
  targetCompanyTier: "Tier-1 Product & FAANG" | "FinTech & High-Growth Unicorns" | "Core R&D & Semiconductor" | "Enterprise & Global Capability Centers";
  timelineWeeks: number;
  weeklyHours: number;
  careerNotes: string;
  resumeRawText: string;
}

export interface EvidenceAuditItem {
  subject: string;
  auditStatus: string;
  diagnostic: string;
  requiredProof: string;
}

export interface WeeklyRoadmapSprint {
  weekNumber: number;
  phaseLabel: string;
  title: string;
  focusSkills: string[];
  estimatedHours: number;
  learningTopics: string[];
  deliverableTitle: string;
  deliverableSpec: string;
  verificationCriteria: string;
}

export interface ProjectBlueprint {
  title: string;
  blueprintType: string;
  targetSkills: string[];
  techStack: string[];
  architectureSpec: string;
  measurableBenchmark: string;
  resumeBulletPreview: string;
  interviewDefenseQuestions: string[];
}

export interface PersonalizedRoadmapData {
  executiveSummary: string;
  placementStrategy: string;
  readinessInsight: string;
  evidenceAudit: EvidenceAuditItem[];
  weeklyRoadmap: WeeklyRoadmapSprint[];
  projectBlueprints: ProjectBlueprint[];
  generatedAt?: string;
  isAiGenerated?: boolean;
}

export interface DefenseEvaluationResult {
  score: number;
  verdict: string;
  strengths: string[];
  missingDepth: string[];
  modelAnswer: string;
}

export interface StudentPreset {
  id: string;
  label: string;
  badgeText: string;
  roleId: string;
  profile: StudentProfile;
  skillRatings: Record<string, ProficiencyLevel>;
  projects: StudentProject[];
  initialRoadmap: PersonalizedRoadmapData;
  completedWeeks: number[];
  completedDeliverables: string[];
}
