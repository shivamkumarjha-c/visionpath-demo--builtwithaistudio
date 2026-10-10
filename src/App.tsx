import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ExternalLink,
  Sparkles,
  FileText,
  Link2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Compass,
  Award,
  Briefcase,
  BookOpen,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Info,
  CheckCircle2,
  Target,
  Layers,
  GraduationCap,
  Play,
} from "lucide-react";
import {
  SIMPLE_SKILL_LEVELS,
  CURATED_BRANCHES,
  CURATED_ROLES,
  CURATED_COMPANIES,
  SAMPLE_JDS,
  SAMPLE_STUDENTS,
  normalizeSkillLevel,
  getEffectiveCompany,
  getBaselineTrack,
  extractJobDescriptionDeterministically,
  computeDeterministicGapAnalysis,
  buildDeterministicGuidance,
  getSkillDetail,
  type SkillLevel,
  type SimpleSkillLevel,
  type Track,
  type StudentForm,
  type PortfolioEvidence,
  type ApplicationEntry,
  type PersonalizedGuidance,
  type SkillDetail,
} from "./data/visionPathEngine";

const STORAGE_KEY = "visionpath_btech_universal_state_v6";

const STEP_ITEMS = [
  {
    index: 0,
    shortLabel: "1. Goal",
    title: "Goal",
    oneLine: "Choose your BTech branch, current year, and target role.",
  },
  {
    index: 1,
    shortLabel: "2. Skill Check",
    title: "Skill Check",
    oneLine: "Rate role-critical skills as Know it, Learning it, or Need to learn.",
  },
  {
    index: 2,
    shortLabel: "3. Action Plan",
    title: "Action Plan",
    oneLine: "See your visual skill gaps, top 3 next actions, 30-day plan, and year-wise BTech roadmap.",
  },
];

const DEFAULT_STUDENT = SAMPLE_STUDENTS[0];

interface SearchableSelectProps {
  label: string;
  sublabel?: string;
  value: string;
  options: string[];
  placeholder?: string;
  allowCustomText?: boolean;
  onChange: (newValue: string) => void;
}

function SearchableAutocomplete({
  label,
  sublabel,
  value,
  options,
  placeholder,
  allowCustomText = true,
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    const matches = options.filter((opt) => opt.toLowerCase().includes(q));
    return matches.length > 0 ? matches : options;
  }, [options, query]);

  const exactMatchExists = useMemo(
    () => options.some((opt) => opt.toLowerCase() === query.trim().toLowerCase()),
    [options, query]
  );

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-800">{label}</span>
        {sublabel && <span className="text-[11px] text-slate-500">{sublabel}</span>}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
            if (allowCustomText) {
              onChange(val);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute inset-y-0 right-0 px-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
          aria-label={`Toggle ${label} options`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-40 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
          {allowCustomText && query.trim() && !exactMatchExists && (
            <button
              type="button"
              onClick={() => {
                onChange(query.trim());
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 flex items-center justify-between cursor-pointer"
            >
              <span>Use custom: “{query.trim()}”</span>
              <span className="text-[11px] text-indigo-600">Custom</span>
            </button>
          )}

          {filteredOptions.map((opt) => {
            const isSelected = opt.toLowerCase() === value.trim().toLowerCase();
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setQuery(opt);
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.step === "number") {
          return Math.min(2, Math.max(0, parsed.step));
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [form, setForm] = useState<StudentForm>(() => {
    try {
      localStorage.removeItem("visionpath_btech_universal_state_v2");
      localStorage.removeItem("visionpath_btech_universal_state_v3");
      localStorage.removeItem("visionpath_btech_universal_state_v4");
      localStorage.removeItem("visionpath_btech_universal_state_v5");
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) {
          const merged = { ...DEFAULT_STUDENT.form, ...parsed.form };
          if (/aarav/i.test(merged.name)) {
            merged.name = "Demo Student";
          }
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDENT.form;
  });

  const [geminiExtractedTrack, setGeminiExtractedTrack] = useState<Track | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.geminiExtractedTrack) return parsed.geminiExtractedTrack;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [manualSkills, setManualSkills] = useState<
    Array<{ skill: string; tier: "Required" | "Preferred" }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.manualSkills)) return parsed.manualSkills;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [levels, setLevels] = useState<Record<string, SkillLevel>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levels && typeof parsed.levels === "object") return parsed.levels;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDENT.levels;
  });

  const [evidence, setEvidence] = useState<PortfolioEvidence>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.evidence) return parsed.evidence;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDENT.evidence;
  });

  const [doneTasks, setDoneTasks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.doneTasks)) return parsed.doneTasks;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDENT.doneTasks;
  });

  const [customTasks, setCustomTasks] = useState<
    Array<{ task: string; reason: string; targetSkill: string }>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.customTasks)) return parsed.customTasks;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [applications, setApplications] = useState<ApplicationEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.applications)) return parsed.applications;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDENT.applications;
  });

  const [geminiGuidance, setGeminiGuidance] = useState<PersonalizedGuidance | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.geminiGuidance) return parsed.geminiGuidance;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_STUDENT.id);
  const [isExtractingJd, setIsExtractingJd] = useState(false);
  const [jdNotice, setJdNotice] = useState<{
    type: "gemini" | "fallback" | "unverified";
    message: string;
  } | null>(null);

  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [guidanceNotice, setGuidanceNotice] = useState<{
    type: "gemini" | "fallback";
    message: string;
  } | null>(null);

  // UI toggles to keep the primary flow fast and uncluttered
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [showJdInputSection, setShowJdInputSection] = useState(false);
  const [showBonusSkillsOnCheck, setShowBonusSkillsOnCheck] = useState(false);
  const [expandedWhySkill, setExpandedWhySkill] = useState<Record<string, boolean>>({});
  const [expandedWhyRec, setExpandedWhyRec] = useState<Record<number, boolean>>({});
  const [showAllFourYears, setShowAllFourYears] = useState(false);
  const [activeOptionalPanel, setActiveOptionalPanel] = useState<
    "none" | "evidence" | "applications" | "requirements"
  >("none");

  const [newSkillInput, setNewSkillInput] = useState("");
  const [newSkillTier, setNewSkillTier] = useState<"Required" | "Preferred">("Required");
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newAppCompany, setNewAppCompany] = useState("");
  const [newAppRole, setNewAppRole] = useState("");
  const [newAppLocation, setNewAppLocation] = useState("Bengaluru · Hybrid");
  const [newAppStatus, setNewAppStatus] = useState<ApplicationEntry["status"]>("Building Proof");
  const [newAppDeadline, setNewAppDeadline] = useState("2026-11-30");
  const [newAppEvidence, setNewAppEvidence] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step,
          form,
          geminiExtractedTrack,
          manualSkills,
          levels,
          evidence,
          doneTasks,
          customTasks,
          applications,
          geminiGuidance,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [
    step,
    form,
    geminiExtractedTrack,
    manualSkills,
    levels,
    evidence,
    doneTasks,
    customTasks,
    applications,
    geminiGuidance,
  ]);

  const effectiveCompany = useMemo(() => getEffectiveCompany(form), [form]);

  const activeTrack: Track = useMemo(() => {
    let base: Track;
    if (geminiExtractedTrack && form.jdText.trim().length >= 25) {
      base = geminiExtractedTrack;
    } else if (form.jdText.trim().length >= 25) {
      base = extractJobDescriptionDeterministically(
        form.jdText,
        form.role,
        form.branch,
        form.goal,
        form.year,
        effectiveCompany,
        form.jobSourceUrl
      );
    } else {
      base = getBaselineTrack(
        form.role,
        form.branch,
        form.goal,
        form.year,
        effectiveCompany,
        form.jobSourceUrl
      );
    }

    if (manualSkills.length === 0) return base;

    const reqList = [...base.required];
    const prefList = [...base.preferred];
    const detailsList = [...base.skillDetails];

    for (const item of manualSkills) {
      const clean = item.skill.trim();
      if (!clean) continue;
      if (item.tier === "Required") {
        if (!reqList.some((x) => x.toLowerCase() === clean.toLowerCase())) {
          reqList.push(clean);
        }
      } else {
        if (
          !reqList.some((x) => x.toLowerCase() === clean.toLowerCase()) &&
          !prefList.some((x) => x.toLowerCase() === clean.toLowerCase())
        ) {
          prefList.push(clean);
        }
      }
      if (!detailsList.some((d) => d.skill.toLowerCase() === clean.toLowerCase())) {
        detailsList.push(
          getSkillDetail(clean, item.tier, form.role, "Added by student")
        );
      }
    }

    return {
      ...base,
      required: reqList,
      preferred: prefList,
      skillDetails: detailsList,
      expectedEvidence: detailsList.map((d) => `${d.skill}: ${d.expectedEvidence}`),
    };
  }, [
    geminiExtractedTrack,
    form.jdText,
    form.role,
    form.branch,
    form.goal,
    form.year,
    effectiveCompany,
    form.jobSourceUrl,
    manualSkills,
  ]);

  const gapAnalysis = useMemo(
    () => computeDeterministicGapAnalysis(activeTrack, levels, evidence, form),
    [activeTrack, levels, evidence, form]
  );

  const baselineGuidance = useMemo(
    () => buildDeterministicGuidance(form, activeTrack, gapAnalysis),
    [form, activeTrack, gapAnalysis]
  );

  const activeGuidance: PersonalizedGuidance = useMemo(() => {
    if (!geminiGuidance) return baselineGuidance;
    return {
      ...baselineGuidance,
      ...geminiGuidance,
      thirtyDayPhases:
        geminiGuidance.thirtyDayPhases && geminiGuidance.thirtyDayPhases.length > 0
          ? geminiGuidance.thirtyDayPhases
          : baselineGuidance.thirtyDayPhases,
      yearPlan:
        geminiGuidance.yearPlan &&
        geminiGuidance.yearPlan.length > 0 &&
        geminiGuidance.yearPlan[0].skillsFocus
          ? geminiGuidance.yearPlan
          : baselineGuidance.yearPlan,
    };
  }, [geminiGuidance, baselineGuidance]);

  // Combine 30-day phase tasks + custom tasks + active year tasks for progress tracking
  const allThirtyDayTasks = useMemo(() => {
    const phaseTasks = activeGuidance.thirtyDayPhases.flatMap((p) => p.tasks);
    return [...phaseTasks, ...customTasks];
  }, [activeGuidance.thirtyDayPhases, customTasks]);

  const completedThirtyDayCount = useMemo(
    () => allThirtyDayTasks.filter((t) => doneTasks.includes(t.task)).length,
    [allThirtyDayTasks, doneTasks]
  );

  const thirtyDayCompletionPct = useMemo(
    () =>
      allThirtyDayTasks.length === 0
        ? 0
        : Math.round((completedThirtyDayCount / allThirtyDayTasks.length) * 100),
    [completedThirtyDayCount, allThirtyDayTasks.length]
  );

  const currentYearStage = useMemo(() => {
    return (
      activeGuidance.yearPlan.find((y) => y.statusForStudent === "Current Active Year") ||
      activeGuidance.yearPlan[1] ||
      activeGuidance.yearPlan[0]
    );
  }, [activeGuidance.yearPlan]);

  const topThreeGaps = useMemo(() => {
    const nonLow = gapAnalysis.skillGaps.filter((g) => g.gapBand !== "Low gap");
    return (nonLow.length > 0 ? nonLow : gapAnalysis.skillGaps).slice(0, 3);
  }, [gapAnalysis.skillGaps]);

  const updateFormField = <K extends keyof StudentForm>(key: K, value: StudentForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (
      key === "role" ||
      key === "branch" ||
      key === "goal" ||
      key === "year" ||
      key === "companySelection" ||
      key === "customCompany"
    ) {
      setGeminiGuidance(null);
    }
    if (key === "jdText" && String(value).trim().length < 25) {
      setGeminiExtractedTrack(null);
    }
  };

  const handleLoadSampleStudent = (presetId: string, jumpToResults = false) => {
    const preset = SAMPLE_STUDENTS.find((p) => p.id === presetId) || SAMPLE_STUDENTS[0];
    setSelectedPresetId(preset.id);
    setForm(preset.form);
    setLevels(preset.levels);
    setEvidence(preset.evidence);
    setDoneTasks(preset.doneTasks);
    setCustomTasks([]);
    setManualSkills([]);
    setApplications(preset.applications);
    setGeminiExtractedTrack(null);
    setGeminiGuidance(null);
    setJdNotice(null);
    setGuidanceNotice(null);
    if (jumpToResults) {
      setStep(2);
    }
  };

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    handleLoadSampleStudent(DEFAULT_STUDENT.id, false);
    setStep(0);
  };

  const handleExtractJobDescription = async () => {
    const text = form.jdText.trim();
    if (!text || text.length < 25) {
      setGeminiExtractedTrack(null);
      setJdNotice({
        type: "unverified",
        message: `Company-specific requirements not verified — using the ${activeTrack.roleProfileName} role profile.`,
      });
      return;
    }

    setIsExtractingJd(true);
    setJdNotice(null);

    try {
      const response = await fetch("/api/gemini/extract-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: text,
          jobSourceUrl: form.jobSourceUrl,
          role: form.role,
          branch: form.branch,
          company: effectiveCompany,
          goal: form.goal,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.required) && data.required.length >= 2) {
        const baseline = getBaselineTrack(
          form.role,
          form.branch,
          form.goal,
          form.year,
          effectiveCompany,
          form.jobSourceUrl
        );
        const mappedDetails: SkillDetail[] = Array.isArray(data.skillDetails)
          ? data.skillDetails.map((sd: SkillDetail) => ({
              skill: sd.skill,
              tier: sd.tier === "Preferred" ? "Preferred" : "Required",
              whyItMatters:
                sd.whyItMatters ||
                getSkillDetail(sd.skill, "Required", form.role).whyItMatters,
              expectedEvidence:
                sd.expectedEvidence ||
                getSkillDetail(sd.skill, "Required", form.role).expectedEvidence,
              sourceSnippet: sd.sourceSnippet || "Extracted from supplied JD text",
            }))
          : [
              ...data.required.map((s: string) =>
                getSkillDetail(s, "Required", form.role, "Extracted from JD")
              ),
              ...(data.preferred || []).map((s: string) =>
                getSkillDetail(s, "Preferred", form.role, "Extracted from JD")
              ),
            ];

        const extractedTrack: Track = {
          ...baseline,
          required: data.required,
          preferred:
            Array.isArray(data.preferred) && data.preferred.length > 0
              ? data.preferred
              : [],
          responsibilities:
            Array.isArray(data.responsibilities) && data.responsibilities.length > 0
              ? data.responsibilities
              : baseline.responsibilities,
          expectedEvidence:
            Array.isArray(data.expectedEvidence) && data.expectedEvidence.length > 0
              ? data.expectedEvidence
              : mappedDetails.map((d) => `${d.skill}: ${d.expectedEvidence}`),
          skillDetails: mappedDetails,
          projectTitle: `JD-Verified Project for ${form.role}${effectiveCompany ? ` (${effectiveCompany})` : ""}`,
          project: data.recommendedProject || baseline.project,
          projectReason:
            data.recommendedProjectReason ||
            `Built around the exact skills verified from your pasted job description.`,
          tasks:
            Array.isArray(data.tasks) && data.tasks.length > 0
              ? data.tasks.map((t: string, i: number) => ({
                  task: t,
                  reason: `Directly addresses extracted JD requirement #${i + 1}.`,
                  targetSkill: data.required[i % data.required.length] || form.role,
                }))
              : baseline.tasks,
          sourceType: "jd-gemini",
          isCompanyVerified: true,
          verificationStatusLabel: `Verified from Pasted Job Description${effectiveCompany ? ` (${effectiveCompany})` : ""}`,
          sourceSummary: `Extracted ${data.required.length} required and ${(data.preferred || []).length} preferred skills strictly from your pasted job description.`,
          missingInformationNotes: Array.isArray(data.missingInformationNotes)
            ? data.missingInformationNotes
            : [],
        };

        setGeminiExtractedTrack(extractedTrack);
        setJdNotice({
          type: "gemini",
          message: `Verified ${extractedTrack.required.length} required & ${extractedTrack.preferred.length} preferred skills from your pasted JD.`,
        });
      } else {
        throw new Error("Insufficient skills in JD response");
      }
    } catch {
      const detTrack = extractJobDescriptionDeterministically(
        text,
        form.role,
        form.branch,
        form.goal,
        form.year,
        effectiveCompany,
        form.jobSourceUrl
      );
      setGeminiExtractedTrack(detTrack);
      setJdNotice({
        type: detTrack.isCompanyVerified ? "fallback" : "unverified",
        message: detTrack.isCompanyVerified
          ? `Verified ${detTrack.required.length} required & ${detTrack.preferred.length} preferred skills from your pasted JD.`
          : `Company-specific requirements not verified — using the ${detTrack.roleProfileName} profile.`,
      });
    } finally {
      setIsExtractingJd(false);
    }
  };

  const handlePersonalizeWithGemini = async () => {
    setIsPersonalizing(true);
    setGuidanceNotice(null);

    try {
      const response = await fetch("/api/gemini/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            ...form,
            company: effectiveCompany,
          },
          track: activeTrack,
          levels,
          evidenceLinks: evidence,
          gapSummary: {
            readiness: gapAnalysis.readiness,
            requiredReadiness: gapAnalysis.requiredReadiness,
            preferredReadiness: gapAnalysis.preferredReadiness,
            highGapCount: gapAnalysis.highGapCount,
            mediumGapCount: gapAnalysis.mediumGapCount,
            skillGaps: gapAnalysis.skillGaps.map((g) => ({
              skill: g.skill,
              isRequired: g.isRequired,
              currentLevel: g.currentLevel,
              gapBand: g.gapBand,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setGeminiGuidance({
          ...baselineGuidance,
          executiveSummary: data.executiveSummary || baselineGuidance.executiveSummary,
          recommendations: data.recommendations.slice(0, 3),
          recommendedProject: data.recommendedProject || baselineGuidance.recommendedProject,
          sourceMode: "gemini",
        });
        setGuidanceNotice({
          type: "gemini",
          message: "Action plan personalized with Gemini for your branch, year, and skill check.",
        });
      } else {
        throw new Error("Incomplete Gemini response");
      }
    } catch {
      const fallback = {
        ...baselineGuidance,
        sourceMode: "deterministic-fallback" as const,
      };
      setGeminiGuidance(fallback);
      setGuidanceNotice({
        type: "fallback",
        message: "Using VisionPath deterministic role & year-wise personalization engine.",
      });
    } finally {
      setIsPersonalizing(false);
    }
  };

  const toggleTask = (taskText: string) => {
    setDoneTasks((prev) =>
      prev.includes(taskText) ? prev.filter((x) => x !== taskText) : [...prev, taskText]
    );
  };

  const handleAddManualSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    setManualSkills((prev) => [...prev, { skill: trimmed, tier: newSkillTier }]);
    setLevels((prev) => ({ ...prev, [trimmed]: "Need to learn" }));
    setNewSkillInput("");
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;
    setCustomTasks((prev) => [
      ...prev,
      {
        task: trimmed,
        reason: `Added to your 30-day ${form.role} checklist.`,
        targetSkill: activeTrack.required[0] || form.role,
      },
    ]);
    setNewTaskInput("");
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppCompany.trim() || !newAppRole.trim()) return;
    const entry: ApplicationEntry = {
      id: `app-${Date.now()}`,
      company: newAppCompany.trim(),
      role: newAppRole.trim(),
      locationOrMode: newAppLocation.trim() || "India",
      status: newAppStatus,
      deadlineOrDate: newAppDeadline,
      evidenceShared:
        newAppEvidence.trim() ||
        evidence.githubUrl ||
        evidence.demoUrl ||
        "Portfolio link pending",
      notes: `Target ${form.goal.toLowerCase()} role`,
    };
    setApplications((prev) => [entry, ...prev]);
    setNewAppCompany("");
    setNewAppRole("");
    setNewAppEvidence("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Navigation & Judge Quick Demo Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base tracking-tight text-slate-900">
                  VisionPath
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Year-Wise BTech Planner
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden sm:block">
                VisionPath shows a student what to learn next for a specific role, and how to prove it.
              </p>
            </div>
          </div>

          {/* 1-Click Judge Demo Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600">Demo Profile:</span>
              <select
                aria-label="Load Sample Student Demo"
                value={selectedPresetId}
                onChange={(e) => handleLoadSampleStudent(e.target.value, false)}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {SAMPLE_STUDENTS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.shortBranch} ({preset.form.year})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleLoadSampleStudent(selectedPresetId, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Judge Demo</span>
            </button>

            <button
              type="button"
              onClick={handleResetAll}
              title="Reset to default sample student"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* 3-Step Progress Bar: Goal -> Skill Check -> Action Plan */}
        <div className="bg-slate-100/80 border-t border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
            <nav aria-label="Progress steps" className="flex items-center gap-1.5 sm:gap-3">
              {STEP_ITEMS.map((item, idx) => {
                const isActive = step === item.index;
                const isDone = step > item.index;
                return (
                  <React.Fragment key={item.index}>
                    <button
                      type="button"
                      onClick={() => setStep(item.index)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : isDone
                            ? "bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      <span>{item.shortLabel}</span>
                    </button>
                    {idx < STEP_ITEMS.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline text-slate-500">
                {form.branch.split(" (")[0]} · {form.year} ·{" "}
                <strong className="text-slate-800">{form.role}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                  gapAnalysis.readiness >= 75
                    ? "bg-emerald-100 text-emerald-800"
                    : gapAnalysis.readiness >= 45
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                }`}
              >
                {gapAnalysis.readiness}% Coverage
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Core Problem Statement & How It Works Banner */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Problem Statement: Help BTech students plan skills, projects, internships and placement preparation year-wise</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 pt-0.5">
                “VisionPath shows a student what to learn next for a specific role, and how to prove it.”
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHowItWorks((prev) => !prev)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 cursor-pointer shrink-0"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showHowItWorks ? "Hide How it works" : "How it works (3 steps)"}</span>
            </button>
          </div>

          {showHowItWorks && (
            <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-indigo-700">Step 1 · Goal (30 sec)</div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pick your BTech branch, current year, internship/placement goal, and target role (plus optional company or JD).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-indigo-700">Step 2 · Quick Skill Check (30 sec)</div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Mark role-critical skills with three simple choices: <strong>Know it</strong>, <strong>Learning it</strong>, or <strong>Need to learn</strong>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-bold text-indigo-700">Step 3 · Action Plan (Instant)</div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Get a visual gap chart, top 3 next actions, one practical project, a 30-day weekly checklist, and your Year 1–4 BTech plan.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================
            STEP 0: GOAL (Branch, Year, Internship/Placement, Company Optional, Target Role)
           ========================================================= */}
        {step === 0 && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Step 1 of 3 · Goal
                  </span>
                  <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                    Set Your BTech Year & Target Role
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Tell us your branch, current year, and target role so we can load the exact skills and year-wise plan you need.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Next: Quick Skill Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Demo Switcher Chips for Judges & Students */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Quick load a sample BTech student:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_STUDENTS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadSampleStudent(preset.id, false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedPresetId === preset.id
                          ? "bg-indigo-600 text-white font-semibold"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset.shortBranch} ({preset.form.year})
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary 2-Minute Goal Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableAutocomplete
                  label="1. Degree / BTech Branch"
                  sublabel="Search or type custom"
                  value={form.branch}
                  options={CURATED_BRANCHES}
                  placeholder="e.g., CSE, ECE, Mechanical, Civil..."
                  onChange={(val) => updateFormField("branch", val)}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">2. Current BTech Year</span>
                    <span className="text-[11px] text-slate-500">Adapts Year 1–4 plan</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["1st Year", "2nd Year", "3rd Year", "4th Year"] as const).map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => updateFormField("year", yr)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          form.year === yr
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">3. Primary Goal</span>
                    <span className="text-[11px] text-slate-500">Target outcome</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Internship", "Placement", "Higher studies"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateFormField("goal", g)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          form.goal === g
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <SearchableAutocomplete
                  label="4. Target Job Role"
                  sublabel="Search or type custom"
                  value={form.role}
                  options={CURATED_ROLES}
                  placeholder="e.g., Backend Developer, ML Engineer, Embedded..."
                  onChange={(val) => updateFormField("role", val)}
                />
              </div>

              {/* Popular Role Quick-Select Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Popular roles:</span>
                {[
                  "Backend Developer",
                  "ML Engineer",
                  "Data Analyst",
                  "Frontend Developer",
                  "Embedded Systems Engineer",
                  "Mechanical Design Engineer",
                ].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateFormField("role", r)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                      form.role.toLowerCase() === r.toLowerCase()
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Company Field (Optional) & Expandable Job Description Source Verification */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <SearchableAutocomplete
                    label="5. Target Company (Optional)"
                    sublabel={
                      form.goal === "Higher studies"
                        ? "Optional for Higher studies"
                        : "Select or choose Other"
                    }
                    value={form.companySelection}
                    options={["", ...CURATED_COMPANIES]}
                    placeholder="Optional — e.g., Google, Razorpay, Qualcomm, TCS, Other"
                    allowCustomText={false}
                    onChange={(val) => updateFormField("companySelection", val)}
                  />
                  {form.companySelection === "Other" && (
                    <input
                      type="text"
                      value={form.customCompany}
                      onChange={(e) => updateFormField("customCompany", e.target.value)}
                      placeholder="Enter custom company name..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    />
                  )}
                </div>

                {/* Source Status Summary Card */}
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    activeTrack.isCompanyVerified
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : effectiveCompany
                        ? "bg-amber-50/80 border-amber-200 text-amber-950"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold flex items-center gap-1.5">
                      {activeTrack.isCompanyVerified ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{activeTrack.verificationStatusLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowJdInputSection((prev) => !prev)}
                      className="text-indigo-700 font-semibold hover:underline cursor-pointer shrink-0"
                    >
                      {showJdInputSection ? "Hide JD box" : "Paste JD (Optional)"}
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {activeTrack.sourceSummary}
                  </p>
                </div>
              </div>

              {/* Optional Collapsible Job Description / Careers URL Verification */}
              {showJdInputSection && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Optional: Paste Job Description or Careers URL
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        VisionPath never guesses company requirements from a company name alone. Paste a JD to extract exact required skills.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(SAMPLE_JDS).map((sampleRole) => (
                        <button
                          key={sampleRole}
                          type="button"
                          onClick={() => {
                            updateFormField("role", sampleRole);
                            updateFormField("jdText", SAMPLE_JDS[sampleRole]);
                          }}
                          className="px-2 py-1 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Load {sampleRole} JD
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="url"
                    value={form.jobSourceUrl}
                    onChange={(e) => updateFormField("jobSourceUrl", e.target.value)}
                    placeholder="Optional public job posting URL (e.g., https://careers.company.com/...)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />

                  <textarea
                    rows={4}
                    value={form.jdText}
                    onChange={(e) => updateFormField("jdText", e.target.value)}
                    placeholder="Paste the job description text here to extract verified required & preferred skills..."
                    className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-mono"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExtractJobDescription}
                        disabled={isExtractingJd}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isExtractingJd ? "Verifying JD..." : "Verify Skills from JD"}</span>
                      </button>
                      {form.jdText.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            updateFormField("jdText", "");
                            setGeminiExtractedTrack(null);
                            setJdNotice(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          Clear JD
                        </button>
                      )}
                    </div>
                    {jdNotice && (
                      <span className="text-xs font-medium text-indigo-700">
                        {jdNotice.message}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  Loaded <strong>{activeTrack.required.length} required</strong> &{" "}
                  <strong>{activeTrack.preferred.length} preferred</strong> skills for{" "}
                  <strong className="text-slate-900">{form.role}</strong>.
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Continue to Quick Skill Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            STEP 1: QUICK SKILL CHECK (Role-Critical Skills + 3 Simple Choices)
           ========================================================= */}
        {step === 1 && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Step 2 of 3 · Quick Skill Check
                  </span>
                  <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900">
                    Rate Your {form.role} Skills
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Mark each role-critical skill with one of three simple choices: <strong>Know it</strong>, <strong>Learning it</strong>, or <strong>Need to learn</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
                  >
                    <span>See My Action Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Compact Source Verification Banner */}
              <div
                className={`p-3 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                  activeTrack.isCompanyVerified
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/70 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeTrack.isCompanyVerified ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    <strong>{activeTrack.verificationStatusLabel}:</strong>{" "}
                    {activeTrack.sourceSummary}
                  </span>
                </div>
                {activeTrack.missingInformationNotes.length > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/80 border border-amber-300/80">
                    {activeTrack.missingInformationNotes[0]}
                  </span>
                )}
              </div>

              {/* Role-Critical Skills List with 3 Simple Choices */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Role-Critical Required Skills ({activeTrack.required.length})
                  </h2>
                  <span className="text-xs text-slate-500">
                    {gapAnalysis.requiredReadyCount} of {gapAnalysis.requiredTotalCount} marked “Know it”
                  </span>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {activeTrack.required.map((skill) => {
                    const currentSimple: SimpleSkillLevel = normalizeSkillLevel(levels[skill]);
                    const detail =
                      activeTrack.skillDetails.find(
                        (d) => d.skill.toLowerCase() === skill.toLowerCase()
                      ) || getSkillDetail(skill, "Required", form.role);
                    const isExpanded = Boolean(expandedWhySkill[skill]);

                    return (
                      <div key={skill} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{skill}</span>
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Required
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedWhySkill((prev) => ({
                                    ...prev,
                                    [skill]: !prev[skill],
                                  }))
                                }
                                className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 cursor-pointer"
                              >
                                {isExpanded ? "Hide why" : "Why & proof?"}
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="text-xs text-slate-600 pt-1 space-y-0.5">
                                <p>
                                  <strong className="text-slate-800">Why it matters:</strong>{" "}
                                  {detail.whyItMatters}
                                </p>
                                <p>
                                  <strong className="text-slate-800">Expected proof:</strong>{" "}
                                  {detail.expectedEvidence}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Three Simple Choices: Know it | Learning it | Need to learn */}
                          <div className="grid grid-cols-3 gap-1.5 shrink-0 sm:w-80">
                            {SIMPLE_SKILL_LEVELS.map((choice) => {
                              const selected = currentSimple === choice;
                              const activeStyle =
                                choice === "Know it"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : choice === "Learning it"
                                    ? "bg-amber-500 text-white border-amber-500"
                                    : "bg-rose-600 text-white border-rose-600";

                              return (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() =>
                                    setLevels((prev) => ({ ...prev, [skill]: choice }))
                                  }
                                  className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                    selected
                                      ? `${activeStyle} shadow-xs`
                                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                  }`}
                                >
                                  {choice}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Toggle for Preferred / Bonus Skills & Adding Custom Skills */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowBonusSkillsOnCheck((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                >
                  {showBonusSkillsOnCheck ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>
                    {showBonusSkillsOnCheck
                      ? "Hide Preferred / Bonus Skills & Role Details"
                      : `Optional: Rate ${activeTrack.preferred.length} Preferred / Bonus Skills or Add Custom Skill`}
                  </span>
                </button>

                {showBonusSkillsOnCheck && (
                  <div className="mt-3 space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    {activeTrack.preferred.length > 0 && (
                      <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {activeTrack.preferred.map((skill) => {
                          const currentSimple = normalizeSkillLevel(levels[skill]);
                          return (
                            <div
                              key={skill}
                              className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">{skill}</span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  Preferred
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 shrink-0 sm:w-80">
                                {SIMPLE_SKILL_LEVELS.map((choice) => {
                                  const selected = currentSimple === choice;
                                  const activeStyle =
                                    choice === "Know it"
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : choice === "Learning it"
                                        ? "bg-amber-500 text-white border-amber-500"
                                        : "bg-rose-600 text-white border-rose-600";
                                  return (
                                    <button
                                      key={choice}
                                      type="button"
                                      onClick={() =>
                                        setLevels((prev) => ({ ...prev, [skill]: choice }))
                                      }
                                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                                        selected
                                          ? activeStyle
                                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                      }`}
                                    >
                                      {choice}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Custom Skill */}
                    <form onSubmit={handleAddManualSkill} className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder="Add custom skill (e.g., Docker, GraphQL, ANSYS)..."
                        className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <select
                        value={newSkillTier}
                        onChange={(e) =>
                          setNewSkillTier(e.target.value as "Required" | "Preferred")
                        }
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Required">Required</option>
                        <option value="Preferred">Preferred</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                      >
                        + Add Skill
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Goal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Build My Action Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            STEP 2: ACTION PLAN (Readiness Signal, Visual Gap Chart, Top 3 Next Actions,
            Year-Wise BTech Plan, 30-Day Weekly Checklist, and Optional Deep Tools)
           ========================================================= */}
        {step === 2 && (
          <section className="space-y-5">
            {/* 1. Large Readiness Signal & Context Banner (No Hiring Predictions!) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      Step 3 of 3 · Personalized Action Plan
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        activeTrack.isCompanyVerified
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {activeTrack.verificationStatusLabel}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                    {form.year} BTech Plan for {form.role}
                    {effectiveCompany ? ` (${effectiveCompany})` : ""}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Here is your role skill coverage, current-vs-target gap chart, top 3 next actions, and year-wise BTech roadmap.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Update Skill Check</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePersonalizeWithGemini}
                    disabled={isPersonalizing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isPersonalizing ? "Personalizing..." : "Personalize with Gemini"}
                    </span>
                  </button>
                </div>
              </div>

              {guidanceNotice && (
                <div className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900 flex items-center justify-between">
                  <span>{guidanceNotice.message}</span>
                </div>
              )}

              {/* Large Readiness Signal Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                <div
                  className={`p-4 rounded-xl border ${
                    gapAnalysis.readinessSignal.tone === "emerald"
                      ? "bg-emerald-50/70 border-emerald-200"
                      : gapAnalysis.readinessSignal.tone === "amber"
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-rose-50/70 border-rose-200"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Role Skill Coverage
                    </span>
                    <span className="text-2xl font-mono font-extrabold text-slate-900">
                      {gapAnalysis.readiness}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white/90 rounded-full overflow-hidden my-2 border border-slate-200/80">
                    <div
                      className={`h-full transition-all duration-300 ${
                        gapAnalysis.readinessSignal.tone === "emerald"
                          ? "bg-emerald-600"
                          : gapAnalysis.readinessSignal.tone === "amber"
                            ? "bg-amber-500"
                            : "bg-rose-600"
                      }`}
                      style={{ width: `${gapAnalysis.readiness}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {gapAnalysis.readinessSignal.label}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {gapAnalysis.readinessSignal.summary}
                  </p>
                </div>

                {/* Gap Breakdown Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Skill Gap Breakdown
                  </div>
                  <div className="grid grid-cols-3 gap-2 my-2">
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-center">
                      <div className="text-lg font-mono font-bold text-rose-700">
                        {gapAnalysis.highGapCount}
                      </div>
                      <div className="text-[10px] font-semibold text-rose-800">High Gap</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                      <div className="text-lg font-mono font-bold text-amber-700">
                        {gapAnalysis.mediumGapCount}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-800">Medium Gap</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                      <div className="text-lg font-mono font-bold text-emerald-700">
                        {gapAnalysis.lowGapCount}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-800">Low Gap</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Measures current skill coverage vs role requirements (not a hiring prediction).
                  </p>
                </div>

                {/* 30-Day Checklist Completion Signal */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      30-Day Plan Progress
                    </span>
                    <span className="text-2xl font-mono font-extrabold text-indigo-700">
                      {thirtyDayCompletionPct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white rounded-full overflow-hidden my-2 border border-slate-200">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${thirtyDayCompletionPct}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {completedThirtyDayCount} of {allThirtyDayTasks.length} tasks completed
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Current stage: <strong>{currentYearStage.yearLabel}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Top 3 Next Actions + Prioritized Visual Gap Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 Cols: Prioritized Current vs Target Visual Gap Chart */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-display font-bold text-slate-900">
                      Prioritized Skill Gap Chart (Current vs. Target)
                    </h2>
                    <p className="text-xs text-slate-600">
                      Sorted by priority: required skills with the largest gap first, then preferred skills.
                    </p>
                  </div>

                  {/* Accessible Legend */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      High gap
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Medium gap
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Low gap
                    </span>
                  </div>
                </div>

                {/* Horizontal Bar Comparison Rows */}
                <div className="space-y-3">
                  {gapAnalysis.skillGaps.map((item) => {
                    const barColor =
                      item.gapBand === "High gap"
                        ? "bg-rose-600"
                        : item.gapBand === "Medium gap"
                          ? "bg-amber-500"
                          : "bg-emerald-600";

                    const badgeStyle =
                      item.gapBand === "High gap"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : item.gapBand === "Medium gap"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200";

                    return (
                      <div
                        key={item.skill}
                        className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.skill}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                item.isRequired
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : "bg-slate-200/80 text-slate-700"
                              }`}
                            >
                              {item.isRequired ? "Required" : "Preferred"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[11px] text-slate-600 font-mono">
                              Current: <strong>{item.currentLevel}</strong> ({item.score}%) / Target:{" "}
                              <strong>{item.targetScore}%</strong>
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${badgeStyle}`}
                            >
                              {item.gapBand}
                            </span>
                          </div>
                        </div>

                        {/* Visual Comparison Bar: Current Fill vs Target Marker */}
                        <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          {/* Target level indicator background */}
                          <div
                            className="absolute inset-y-0 left-0 bg-slate-300/60 border-r-2 border-slate-700"
                            style={{ width: `${item.targetScore}%` }}
                            title={`Target Level: ${item.targetScore}%`}
                          />
                          {/* Student current level bar */}
                          <div
                            className={`relative h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${ Math.max(6, item.score) }%` }}
                          />
                        </div>

                        {/* Quick inline switcher so student can update level right from chart */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-slate-600">
                          <span className="truncate max-w-md">{item.whatIsMissing}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {SIMPLE_SKILL_LEVELS.map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() =>
                                  setLevels((prev) => ({ ...prev, [item.skill]: lvl }))
                                }
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                  item.currentLevel === lvl
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 Cols: Exactly Three Priority Next Actions with Compact Explanation */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-display font-bold text-slate-900">
                      Top 3 Next Actions (What to Learn First)
                    </h2>
                    <p className="text-xs text-slate-600">
                      Focused on your top skill gaps and connected to your {form.year} BTech plan.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {topThreeGaps.map((gap, index) => {
                      const isExpanded = Boolean(expandedWhyRec[index]);
                      const badgeTone =
                        gap.gapBand === "High gap"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : gap.gapBand === "Medium gap"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200";

                      return (
                        <div
                          key={gap.skill}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                                Action #{index + 1} · {form.year} Priority
                              </span>
                              <h3 className="text-sm font-bold text-slate-900">
                                {gap.skill}
                              </h3>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${badgeTone}`}
                            >
                              {gap.gapBand}
                            </span>
                          </div>

                          <div className="text-xs space-y-1 text-slate-700">
                            <p>
                              <strong className="text-slate-900">What is missing:</strong>{" "}
                              {gap.whatIsMissing}
                            </p>
                            <p>
                              <strong className="text-slate-900">Evidence needed:</strong>{" "}
                              {gap.expectedEvidence}
                            </p>
                          </div>

                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedWhyRec((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }))
                              }
                              className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                              <span>Why this recommendation?</span>
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                              <p>
                                <strong className="text-slate-800">Why it matters for {form.role}:</strong>{" "}
                                {gap.whyItMatters}
                              </p>
                              <p>
                                <strong className="text-slate-800">Next step:</strong>{" "}
                                {gap.nextAction}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* One Practical Role Project Card */}
                <div className="p-4 rounded-xl bg-indigo-950 text-white space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
                      1 Practical Project to Build
                    </span>
                    <span className="text-[11px] text-indigo-200 font-medium">
                      Covers Top Gaps
                    </span>
                  </div>
                  <h3 className="text-sm font-display font-bold">
                    {activeGuidance.recommendedProject.title}
                  </h3>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    {activeGuidance.recommendedProject.summary}
                  </p>
                  <div className="pt-1 space-y-1">
                    <div className="text-[11px] font-semibold text-indigo-200">
                      Key Milestones & Proof:
                    </div>
                    <ul className="text-xs text-indigo-100 space-y-1 list-disc list-inside">
                      {activeGuidance.recommendedProject.milestones.slice(0, 3).map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  {activeGuidance.recommendedProject.resourceLinks.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {activeGuidance.recommendedProject.resourceLinks.slice(0, 2).map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Structured 30-Day Plan (Week 1 to Week 4 Cards with Checkboxes, Outputs & Proof) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Next 30-Day Execution Plan
                  </span>
                  <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                    Week-by-Week Checklist (With Outputs & Evidence to Publish)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Check off tasks as you build. Every week ends with a concrete output and proof artifact.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {completedThirtyDayCount}/{allThirtyDayTasks.length} Tasks Done ({thirtyDayCompletionPct}%)
                    </div>
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${thirtyDayCompletionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {activeGuidance.thirtyDayPhases.map((phase) => {
                  const doneInPhase = phase.tasks.filter((t) =>
                    doneTasks.includes(t.task)
                  ).length;
                  return (
                    <div
                      key={phase.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {phase.phaseLabel}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            {doneInPhase}/{phase.tasks.length}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{phase.title}</h3>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-800">Objective:</strong> {phase.objective}
                        </p>

                        {/* Checkable Tasks */}
                        <div className="space-y-1.5 pt-1">
                          {phase.tasks.map((t) => {
                            const isChecked = doneTasks.includes(t.task);
                            return (
                              <label
                                key={t.task}
                                className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? "bg-emerald-50/70 border-emerald-200 text-slate-500 line-through"
                                    : "bg-white border-slate-200 text-slate-800 hover:border-indigo-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTask(t.task)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span>{t.task}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/80 text-[11px] space-y-1 text-slate-600">
                        <div>
                          <strong className="text-slate-900">Expected Output:</strong>{" "}
                          {phase.expectedOutput}
                        </div>
                        <div>
                          <strong className="text-indigo-800">Proof to Publish:</strong>{" "}
                          {phase.proofToPublish}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom 30-Day Task Input */}
              <form
                onSubmit={handleAddCustomTask}
                className="pt-2 flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add your own 30-day action item..."
                  className="flex-1 min-w-[220px] px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                >
                  + Add Task
                </button>
              </form>
            </div>

            {/* 4. Year-Wise BTech Plan (Year 1 to Year 4 — Adapted to Student's Current Year) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Year-Wise BTech Journey (Year 1 – Year 4)
                  </span>
                  <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                    Your Year-Wise Skills, Projects, Internships & Placement Plan
                  </h2>
                  <p className="text-xs text-slate-600">
                    Highlighting your current stage (<strong>{form.year}</strong>) and next 2 priority actions, with all 4 BTech years structured clearly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllFourYears((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                >
                  {showAllFourYears ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>
                    {showAllFourYears
                      ? "Collapse Other BTech Years"
                      : "Expand Full 4-Year BTech Roadmap (Years 1–4)"}
                  </span>
                </button>
              </div>

              {/* Highlighted Current Year + Next Two Priority Actions */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border-2 border-indigo-500/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-600 text-white">
                      Current Active Stage · {form.year}
                    </span>
                    <h3 className="text-sm sm:text-base font-display font-bold text-slate-900">
                      {currentYearStage.yearLabel}: {currentYearStage.stageTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-indigo-800">
                    {currentYearStage.objective}
                  </span>
                </div>

                {/* Next 2 Highest-Priority Actions for Current Year */}
                <div className="p-3 rounded-lg bg-white border border-indigo-200 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    Next 2 Highest-Priority Actions for {form.year}:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(currentYearStage.priorityActions || currentYearStage.items.slice(0, 2)).map(
                      (act, i) => {
                        const checked = doneTasks.includes(act);
                        return (
                          <label
                            key={act}
                            className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                              checked
                                ? "bg-emerald-50 border-emerald-200 text-slate-500 line-through"
                                : "bg-slate-50 border-slate-200 text-slate-900 font-medium"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTask(act)}
                              className="mt-0.5 rounded text-indigo-600 cursor-pointer"
                            />
                            <span>
                              <strong>Priority {i + 1}:</strong> {act}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Structured 6-Pillar Grid for Current Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">1. Skills to Build</span>
                    <span className="text-slate-600">{currentYearStage.skillsFocus}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">2. Projects</span>
                    <span className="text-slate-600">{currentYearStage.projectsFocus}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">3. Internship Actions</span>
                    <span className="text-slate-600">{currentYearStage.internshipActions}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">4. Placement Preparation</span>
                    <span className="text-slate-600">{currentYearStage.placementPrep}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-slate-900 block">5. Measurable Outputs</span>
                    <span className="text-slate-600">{currentYearStage.measurableOutputs}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="font-bold text-indigo-800 block">6. Evidence to Create</span>
                    <span className="text-slate-700 font-medium">
                      {currentYearStage.evidenceToCreate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsed / Expandable Full 4-Year BTech Milestones */}
              {showAllFourYears && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {activeGuidance.yearPlan.map((yr) => {
                    const isCurrent = yr.statusForStudent === "Current Active Year";
                    return (
                      <div
                        key={yr.yearLabel}
                        className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                          isCurrent
                            ? "bg-indigo-50/40 border-indigo-400"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900">{yr.yearLabel}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              isCurrent
                                ? "bg-indigo-600 text-white"
                                : yr.statusForStudent === "Completed Foundation"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {yr.statusForStudent}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">{yr.objective}</p>
                        <div className="space-y-1 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <strong className="text-slate-900">Skills:</strong> {yr.skillsFocus}
                          </div>
                          <div>
                            <strong className="text-slate-900">Projects:</strong> {yr.projectsFocus}
                          </div>
                          <div>
                            <strong className="text-slate-900">Internships:</strong>{" "}
                            {yr.internshipActions}
                          </div>
                          <div>
                            <strong className="text-slate-900">Placement Prep:</strong>{" "}
                            {yr.placementPrep}
                          </div>
                          <div>
                            <strong className="text-slate-900">Measurable Output:</strong>{" "}
                            {yr.measurableOutputs}
                          </div>
                          <div>
                            <strong className="text-indigo-800">Evidence:</strong>{" "}
                            {yr.evidenceToCreate}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Secondary / Optional Tools (Portfolio Proof Vault, Application Tracker, Full Role Matrix) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Optional Trackers & Detailed Role Matrix
                  </h2>
                  <p className="text-xs text-slate-500">
                    Attach proof links, track internship/placement applications, or inspect full role responsibilities.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveOptionalPanel((p) => (p === "evidence" ? "none" : "evidence"))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      activeOptionalPanel === "evidence"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 inline mr-1" />
                    Portfolio Evidence Links ({gapAnalysis.verifiedProofCount})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveOptionalPanel((p) =>
                        p === "applications" ? "none" : "applications"
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      activeOptionalPanel === "applications"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                    Application Tracker ({applications.length})
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveOptionalPanel((p) =>
                        p === "requirements" ? "none" : "requirements"
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      activeOptionalPanel === "requirements"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Role Details & Source Notes
                  </button>
                </div>
              </div>

              {/* Optional Panel 1: Portfolio & Evidence Vault */}
              {activeOptionalPanel === "evidence" && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">GitHub / CAD Repository URL</span>
                    <input
                      type="url"
                      value={evidence.githubUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, githubUrl: e.target.value }))
                      }
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Live Demo / Simulation Link</span>
                    <input
                      type="url"
                      value={evidence.demoUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, demoUrl: e.target.value }))
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">1-Page Resume Link</span>
                    <input
                      type="url"
                      value={evidence.resumeUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, resumeUrl: e.target.value }))
                      }
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-semibold text-slate-700">Certificate / Course Proof</span>
                    <input
                      type="url"
                      value={evidence.certificateUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, certificateUrl: e.target.value }))
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </label>
                </div>
              )}

              {/* Optional Panel 2: Internship & Placement Application Tracker */}
              {activeOptionalPanel === "applications" && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <form
                    onSubmit={handleAddApplication}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                  >
                    <input
                      type="text"
                      value={newAppCompany}
                      onChange={(e) => setNewAppCompany(e.target.value)}
                      placeholder="Company (e.g. Google)"
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newAppRole}
                      onChange={(e) => setNewAppRole(e.target.value)}
                      placeholder="Role (e.g. SDE Intern)"
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                    <select
                      value={newAppStatus}
                      onChange={(e) =>
                        setNewAppStatus(e.target.value as ApplicationEntry["status"])
                      }
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Wishlist">Wishlist</option>
                      <option value="Building Proof">Building Proof</option>
                      <option value="Applied">Applied</option>
                      <option value="Online Assessment">Online Assessment</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                    </select>
                    <input
                      type="text"
                      value={newAppEvidence}
                      onChange={(e) => setNewAppEvidence(e.target.value)}
                      placeholder="Proof link shared"
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                    >
                      + Track Application
                    </button>
                  </form>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 bg-slate-50 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{app.company}</span> ·{" "}
                          <span className="text-slate-700">{app.role}</span>
                          <div className="text-[11px] text-slate-500">
                            Proof: {app.evidenceShared}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
                            {app.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setApplications((prev) => prev.filter((x) => x.id !== app.id))
                            }
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            aria-label="Remove application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Panel 3: Full Role Details & Source Verification Notes */}
              {activeOptionalPanel === "requirements" && (
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">
                      {activeTrack.verificationStatusLabel}
                    </div>
                    <p className="text-slate-600">{activeTrack.sourceSummary}</p>
                    {activeTrack.missingInformationNotes.length > 0 && (
                      <ul className="list-disc list-inside text-amber-800 pt-1 space-y-0.5">
                        {activeTrack.missingInformationNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">
                        Role Responsibilities ({form.role})
                      </div>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        {activeTrack.responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">
                        Expected Portfolio Evidence
                      </div>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        {activeTrack.expectedEvidence.slice(0, 5).map((ev) => (
                          <li key={ev}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
