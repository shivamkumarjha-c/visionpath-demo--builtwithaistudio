import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ExternalLink,
  Sparkles,
  Link2,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Briefcase,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
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

const STORAGE_KEY = "visionpath_btech_universal_state_v7";

const SCREENS = [
  { index: 0, label: "Welcome", num: "01" },
  { index: 1, label: "Goal", num: "02" },
  { index: 2, label: "Skill Check", num: "03" },
  { index: 3, label: "Action Plan", num: "04" },
  { index: 4, label: "Roadmap", num: "05" },
  { index: 5, label: "Progress", num: "06" },
];

const DEFAULT_STUDENT = SAMPLE_STUDENTS[0];

/**
 * Editorial abstract geometric career & learning illustration (Wix / Kinfolk magazine aesthetic).
 */
function EditorialCareerIllustration() {
  return (
    <div className="relative w-full h-full min-h-[280px] bg-[#F3EFE6] border border-[#141413]/15 rounded-2xl p-6 flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#5C5953] border-b border-[#141413]/12 pb-3">
        <span>Role Trajectory</span>
        <span className="font-mono">Y1 → Y4</span>
      </div>

      <svg
        viewBox="0 0 420 230"
        className="w-full h-auto my-3"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Abstract architectural career trajectory and skill readiness illustration"
      >
        {/* Subtle editorial grid lines */}
        <line x1="20" y1="195" x2="400" y2="195" stroke="#141413" strokeOpacity="0.2" strokeWidth="1" />
        <line x1="20" y1="145" x2="400" y2="145" stroke="#141413" strokeOpacity="0.08" strokeDasharray="3 3" />
        <line x1="20" y1="95" x2="400" y2="95" stroke="#141413" strokeOpacity="0.08" strokeDasharray="3 3" />
        <line x1="20" y1="45" x2="400" y2="45" stroke="#141413" strokeOpacity="0.08" strokeDasharray="3 3" />

        {/* Warm architectural blocks representing 4 BTech Years */}
        <rect x="42" y="148" width="54" height="47" rx="4" fill="#E5DEC9" stroke="#141413" strokeWidth="1.2" />
        <rect x="128" y="114" width="54" height="81" rx="4" fill="#D8E5E7" stroke="#141413" strokeWidth="1.2" />
        <rect x="214" y="78" width="54" height="117" rx="4" fill="#0F5C6E" fillOpacity="0.18" stroke="#0F5C6E" strokeWidth="1.4" />
        <rect x="300" y="42" width="54" height="153" rx="4" fill="#0F5C6E" stroke="#141413" strokeWidth="1.2" />

        {/* Ascending trajectory curve */}
        <path
          d="M 69 140 C 115 130, 140 105, 155 102 C 190 95, 220 68, 241 64 C 275 58, 305 32, 327 28"
          stroke="#141413"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Milestone nodes */}
        <circle cx="69" cy="140" r="4.5" fill="#FBF9F5" stroke="#141413" strokeWidth="2" />
        <circle cx="155" cy="102" r="4.5" fill="#FBF9F5" stroke="#141413" strokeWidth="2" />
        <circle cx="241" cy="64" r="5.5" fill="#0F5C6E" stroke="#FBF9F5" strokeWidth="2" />
        <circle cx="327" cy="28" r="6" fill="#141413" />

        {/* Subtle editorial sun/compass motif */}
        <circle cx="82" cy="56" r="24" stroke="#0F5C6E" strokeOpacity="0.35" strokeWidth="1.2" />
        <circle cx="82" cy="56" r="11" fill="#0F5C6E" fillOpacity="0.15" />

        {/* Labels */}
        <text x="53" y="212" fill="#5C5953" fontSize="10" fontFamily="monospace">YR 01</text>
        <text x="139" y="212" fill="#5C5953" fontSize="10" fontFamily="monospace">YR 02</text>
        <text x="225" y="212" fill="#0F5C6E" fontSize="10" fontWeight="bold" fontFamily="monospace">YR 03</text>
        <text x="311" y="212" fill="#141413" fontSize="10" fontWeight="bold" fontFamily="monospace">YR 04</text>
      </svg>

      <div className="pt-3 border-t border-[#141413]/12 flex items-center justify-between text-xs text-[#4A4843]">
        <span>Skills · Projects · Internships · Placement</span>
        <span className="text-[#0F5C6E] font-semibold">Evidence-First</span>
      </div>
    </div>
  );
}

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
        <span className="text-xs font-semibold uppercase tracking-wider text-[#2C2B29]">
          {label}
        </span>
        {sublabel && <span className="text-[11px] text-[#6E6B64]">{sublabel}</span>}
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
          className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-[#FBF9F5] border border-[#141413]/25 rounded-lg text-[#141413] placeholder:text-[#8C887F] focus:outline-none focus:border-[#0F5C6E]"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute inset-y-0 right-0 px-2.5 flex items-center text-[#5C5953] hover:text-[#141413] cursor-pointer"
          aria-label={`Toggle ${label} options`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-40 mt-1 w-full max-h-56 overflow-y-auto bg-[#FBF9F5] border border-[#141413]/20 rounded-lg shadow-md py-1 text-xs">
          {allowCustomText && query.trim() && !exactMatchExists && (
            <button
              type="button"
              onClick={() => {
                onChange(query.trim());
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 font-medium text-[#0F5C6E] bg-[#E6F1F3] hover:bg-[#d5e8ec] flex items-center justify-between cursor-pointer"
            >
              <span>Use custom: “{query.trim()}”</span>
              <span className="text-[11px]">Custom</span>
            </button>
          )}

          {filteredOptions.map((opt) => {
            const labelText = opt === "" ? "No specific company (Use Role Profile)" : opt;
            const isSelected = opt.toLowerCase() === value.trim().toLowerCase();
            return (
              <button
                key={opt || "__empty__"}
                type="button"
                onClick={() => {
                  setQuery(opt);
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#E6F1F3] text-[#0F5C6E] font-semibold"
                    : "text-[#2C2B29] hover:bg-[#F3EFE6]"
                }`}
              >
                <span>{labelText}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0F5C6E] shrink-0" />}
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
          return Math.min(5, Math.max(0, parsed.step));
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
      localStorage.removeItem("visionpath_btech_universal_state_v6");
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

  const [showJdInputSection, setShowJdInputSection] = useState(false);
  const [showBonusSkillsOnCheck, setShowBonusSkillsOnCheck] = useState(false);
  const [expandedWhySkill, setExpandedWhySkill] = useState<Record<string, boolean>>({});
  const [expandedWhyRec, setExpandedWhyRec] = useState<Record<number, boolean>>({});

  const [newSkillInput, setNewSkillInput] = useState("");
  const [newSkillTier, setNewSkillTier] = useState<"Required" | "Preferred">("Required");
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newAppCompany, setNewAppCompany] = useState("");
  const [newAppRole, setNewAppRole] = useState("");
  const [newAppStatus, setNewAppStatus] = useState<ApplicationEntry["status"]>("Building Proof");
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
        detailsList.push(getSkillDetail(clean, item.tier, form.role, "Added by student"));
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

  const handleLoadSampleStudent = (presetId: string, targetScreen?: number) => {
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
    if (typeof targetScreen === "number") {
      setStep(targetScreen);
    }
  };

  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    handleLoadSampleStudent(DEFAULT_STUDENT.id, 0);
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
          message: "Personalized with Gemini for your branch, year, and skill profile.",
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
        message: "Updated with VisionPath deterministic role & year-wise engine.",
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
      locationOrMode: "India",
      status: newAppStatus,
      deadlineOrDate: "2026-11-30",
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
    <div className="min-h-screen bg-[#FBF9F5] text-[#141413] font-sans pb-20">
      {/* Minimal Editorial Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur border-b border-[#141413]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-left flex items-baseline gap-2.5 cursor-pointer group"
          >
            <span className="font-serif text-2xl font-medium tracking-tight text-[#141413]">
              VisionPath
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#6E6B64] hidden sm:inline">
              BTech Career & Role Edition
            </span>
          </button>

          {/* 6 Editorial Screen Links */}
          <nav
            aria-label="Editorial sections"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-0.5"
          >
            {SCREENS.map((scr) => {
              const active = step === scr.index;
              return (
                <button
                  key={scr.index}
                  type="button"
                  onClick={() => setStep(scr.index)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[#141413] text-[#FBF9F5] font-semibold"
                      : "text-[#4A4843] hover:text-[#141413] hover:bg-[#F3EFE6]"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-65">{scr.num}</span>
                  <span>{scr.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Subtle Sample Student Switcher */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Load Sample Student Demo"
              value={selectedPresetId}
              onChange={(e) => handleLoadSampleStudent(e.target.value)}
              className="text-xs font-medium text-[#2C2B29] bg-[#F3EFE6] border border-[#141413]/15 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F5C6E] cursor-pointer"
            >
              {SAMPLE_STUDENTS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  Sample: {preset.shortBranch} ({preset.form.year})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handleLoadSampleStudent(selectedPresetId, 3)}
              title="Load sample student and jump to Action Plan"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E6F1F3] text-[#0F5C6E] hover:bg-[#d5e8ec] transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden md:inline">Demo</span>
            </button>

            <button
              type="button"
              onClick={handleResetAll}
              title="Reset"
              className="p-1.5 rounded-lg text-[#6E6B64] hover:text-[#141413] hover:bg-[#F3EFE6] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        {/* =========================================================
            SCREEN 1: WELCOME
            Large headline: “Prepare for the role you want.”
            Short supporting text and one strong “Start assessment” button.
           ========================================================= */}
        {step === 0 && (
          <section className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-10 border-b border-[#141413]/15">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#0F5C6E] font-semibold">
                  <span>BTech Year-Wise Career Architecture</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-6xl leading-[1.08] tracking-tight text-[#141413]">
                  Prepare for the role you want.
                </h1>

                <p className="text-base sm:text-lg text-[#4A4843] leading-relaxed max-w-xl">
                  VisionPath shows a BTech student what to learn next for a specific internship or placement role, how to prove it with a practical project, and how to plan from Year 1 to Year 4.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Start assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleStudent(selectedPresetId, 3)}
                    className="inline-flex items-center gap-2 px-4 py-3.5 rounded-lg text-sm font-medium text-[#141413] border border-[#141413]/25 hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                  >
                    <span>View sample action plan</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-[#141413]/12 grid grid-cols-3 gap-4 max-w-lg text-xs text-[#5C5953]">
                  <div>
                    <span className="font-mono text-[#141413] font-semibold block">01 · Goal</span>
                    <span>Branch, year & role</span>
                  </div>
                  <div>
                    <span className="font-mono text-[#141413] font-semibold block">02 · Skill Check</span>
                    <span>3 simple choices</span>
                  </div>
                  <div>
                    <span className="font-mono text-[#141413] font-semibold block">03 · Plan & Proof</span>
                    <span>Gaps, project & 4-yr plan</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <EditorialCareerIllustration />
              </div>
            </div>

            {/* Minimal Editorial Strip: Problem Statement & Sample Branches */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-1">
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#6E6B64] font-semibold">
                  Core Mission
                </span>
                <p className="font-serif text-xl text-[#141413]">
                  “Help BTech students plan skills, projects, internships and placement preparation year-wise.”
                </p>
              </div>

              <div className="md:col-span-7 flex flex-wrap items-center gap-2 md:justify-end">
                <span className="text-xs text-[#6E6B64] mr-1">Explore sample profiles:</span>
                {SAMPLE_STUDENTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadSampleStudent(preset.id, 3)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F3EFE6] text-[#141413] border border-[#141413]/15 hover:border-[#0F5C6E] hover:text-[#0F5C6E] transition-colors cursor-pointer"
                  >
                    {preset.shortBranch}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SCREEN 2: GOAL
            Clean editorial form for branch, year, goal, company, and target role.
           ========================================================= */}
        {step === 1 && (
          <section className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#141413]/15">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F5C6E]">
                  02 / Goal Definition
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#141413]">
                  Select your academic stage and target role.
                </h1>
                <p className="text-sm text-[#5C5953]">
                  Your branch, year, and role determine the exact skill benchmark and four-year roadmap.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
              >
                <span>Continue to Skill Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F3EFE6]/60 p-6 sm:p-8 rounded-2xl border border-[#141413]/15">
              <SearchableAutocomplete
                label="Degree / Branch"
                sublabel="Search or enter custom"
                value={form.branch}
                options={CURATED_BRANCHES}
                placeholder="e.g., CSE, ECE, Mechanical, Civil..."
                onChange={(val) => updateFormField("branch", val)}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2C2B29]">
                    Current Year
                  </span>
                  <span className="text-[11px] text-[#6E6B64]">Personalizes timeline</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["1st Year", "2nd Year", "3rd Year", "4th Year"] as const).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => updateFormField("year", yr)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        form.year === yr
                          ? "bg-[#141413] text-[#FBF9F5] border-[#141413]"
                          : "bg-[#FBF9F5] text-[#2C2B29] border-[#141413]/20 hover:bg-[#F3EFE6]"
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2C2B29]">
                    Primary Goal
                  </span>
                  <span className="text-[11px] text-[#6E6B64]">Target milestone</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["Internship", "Placement", "Higher studies"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateFormField("goal", g)}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        form.goal === g
                          ? "bg-[#141413] text-[#FBF9F5] border-[#141413]"
                          : "bg-[#FBF9F5] text-[#2C2B29] border-[#141413]/20 hover:bg-[#F3EFE6]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <SearchableAutocomplete
                label="Target Job Role"
                sublabel="Search or enter custom"
                value={form.role}
                options={CURATED_ROLES}
                placeholder="e.g., Backend Developer, ML Engineer, Data Analyst..."
                onChange={(val) => updateFormField("role", val)}
              />

              <div className="space-y-2">
                <SearchableAutocomplete
                  label="Target Company (Optional)"
                  sublabel={
                    form.goal === "Higher studies"
                      ? "Optional for Higher studies"
                      : "Curated or Other"
                  }
                  value={form.companySelection}
                  options={["", ...CURATED_COMPANIES]}
                  placeholder="Optional — Google, Microsoft, Razorpay, Qualcomm, Other..."
                  allowCustomText={false}
                  onChange={(val) => updateFormField("companySelection", val)}
                />
                {form.companySelection === "Other" && (
                  <input
                    type="text"
                    value={form.customCompany}
                    onChange={(e) => updateFormField("customCompany", e.target.value)}
                    placeholder="Enter custom company name..."
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF9F5] border border-[#141413]/25 rounded-lg focus:outline-none focus:border-[#0F5C6E]"
                  />
                )}
              </div>

              {/* Source Verification Status Box */}
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#141413]/15 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#141413] flex items-center gap-1.5">
                    {activeTrack.isCompanyVerified ? (
                      <ShieldCheck className="w-4 h-4 text-[#0F5C6E] shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                    <span>{activeTrack.verificationStatusLabel}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowJdInputSection((prev) => !prev)}
                    className="text-xs font-semibold text-[#0F5C6E] hover:underline cursor-pointer"
                  >
                    {showJdInputSection ? "Hide job source" : "Paste JD / URL"}
                  </button>
                </div>
                <p className="text-xs text-[#5C5953] leading-relaxed">
                  {activeTrack.sourceSummary}
                </p>
              </div>
            </div>

            {/* Optional Job Description / Source URL Extractor */}
            {showJdInputSection && (
              <div className="p-6 rounded-2xl bg-[#F3EFE6] border border-[#141413]/15 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-serif text-lg text-[#141413]">
                      Job Description & Source Verification (Optional)
                    </h2>
                    <p className="text-xs text-[#5C5953]">
                      Paste a public job description to extract verified skills. VisionPath never guesses company requirements from a company name alone.
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
                        className="px-2.5 py-1 rounded text-xs font-medium bg-[#FBF9F5] border border-[#141413]/20 text-[#2C2B29] hover:border-[#0F5C6E] cursor-pointer"
                      >
                        Sample {sampleRole} JD
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  value={form.jobSourceUrl}
                  onChange={(e) => updateFormField("jobSourceUrl", e.target.value)}
                  placeholder="Optional public careers URL (e.g., https://careers.company.com/job/...)"
                  className="w-full px-3.5 py-2 text-xs bg-[#FBF9F5] border border-[#141413]/25 rounded-lg focus:outline-none focus:border-[#0F5C6E]"
                />

                <textarea
                  rows={4}
                  value={form.jdText}
                  onChange={(e) => updateFormField("jdText", e.target.value)}
                  placeholder="Paste the job description text here..."
                  className="w-full p-3.5 text-xs bg-[#FBF9F5] border border-[#141413]/25 rounded-lg focus:outline-none focus:border-[#0F5C6E] font-mono"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExtractJobDescription}
                      disabled={isExtractingJd}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isExtractingJd ? "Extracting..." : "Verify Skills from JD"}</span>
                    </button>
                    {form.jdText.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          updateFormField("jdText", "");
                          setGeminiExtractedTrack(null);
                          setJdNotice(null);
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-[#5C5953] hover:text-[#141413] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {jdNotice && (
                    <span className="text-xs font-medium text-[#0F5C6E]">{jdNotice.message}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#141413]/15">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A4843] hover:text-[#141413] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Welcome</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
              >
                <span>Proceed to Skill Check ({activeTrack.required.length} Core Skills)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================
            SCREEN 3: SKILL CHECK
            Show role-critical skills as simple cards with three choices:
            “Know it”, “Learning it”, “Need to learn”.
           ========================================================= */}
        {step === 2 && (
          <section className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#141413]/15">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F5C6E]">
                  03 / Skill Check · {form.role}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#141413]">
                  Assess your role-critical skills.
                </h1>
                <p className="text-sm text-[#5C5953]">
                  Select <strong>Know it</strong>, <strong>Learning it</strong>, or <strong>Need to learn</strong> for each required skill.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-[#141413]/20 text-[#2C2B29] hover:bg-[#F3EFE6] cursor-pointer"
                >
                  Edit Goal
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
                >
                  <span>View Action Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Source Note Strip */}
            <div className="py-3 px-4 rounded-xl bg-[#F3EFE6] border border-[#141413]/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#2C2B29]">
              <div className="flex items-center gap-2">
                {activeTrack.isCompanyVerified ? (
                  <ShieldCheck className="w-4 h-4 text-[#0F5C6E] shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                )}
                <span>
                  <strong>{activeTrack.verificationStatusLabel}:</strong> {activeTrack.sourceSummary}
                </span>
              </div>
              <span className="font-mono font-semibold text-[#0F5C6E]">
                {gapAnalysis.requiredReadyCount}/{gapAnalysis.requiredTotalCount} Known
              </span>
            </div>

            {/* Role-Critical Skill Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTrack.required.map((skill) => {
                const currentSimple: SimpleSkillLevel = normalizeSkillLevel(levels[skill]);
                const detail =
                  activeTrack.skillDetails.find(
                    (d) => d.skill.toLowerCase() === skill.toLowerCase()
                  ) || getSkillDetail(skill, "Required", form.role);
                const isExpanded = Boolean(expandedWhySkill[skill]);

                return (
                  <div
                    key={skill}
                    className="p-5 rounded-xl bg-[#F3EFE6]/55 border border-[#141413]/15 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-serif text-xl text-[#141413]">{skill}</h2>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWhySkill((prev) => ({
                              ...prev,
                              [skill]: !prev[skill],
                            }))
                          }
                          className="text-[11px] font-medium text-[#0F5C6E] hover:underline cursor-pointer"
                        >
                          {isExpanded ? "Hide detail" : "Why this matters"}
                        </button>
                      </div>
                      <p className="text-xs text-[#5C5953]">
                        Expected proof: {detail.expectedEvidence}
                      </p>
                      {isExpanded && (
                        <p className="text-xs text-[#2C2B29] pt-1.5 border-t border-[#141413]/10">
                          {detail.whyItMatters}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {SIMPLE_SKILL_LEVELS.map((choice) => {
                        const selected = currentSimple === choice;
                        const activeStyle =
                          choice === "Know it"
                            ? "bg-[#0F5C6E] text-white border-[#0F5C6E]"
                            : choice === "Learning it"
                              ? "bg-[#B86B14] text-white border-[#B86B14]"
                              : "bg-[#141413] text-[#FBF9F5] border-[#141413]";

                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() =>
                              setLevels((prev) => ({ ...prev, [skill]: choice }))
                            }
                            className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              selected
                                ? activeStyle
                                : "bg-[#FBF9F5] text-[#2C2B29] border-[#141413]/20 hover:bg-[#F3EFE6]"
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

            {/* Optional Preferred / Bonus Skills Accordion */}
            <div className="pt-2 border-t border-[#141413]/15">
              <button
                type="button"
                onClick={() => setShowBonusSkillsOnCheck((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5C6E] hover:underline cursor-pointer"
              >
                {showBonusSkillsOnCheck ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>
                  {showBonusSkillsOnCheck
                    ? "Hide preferred / bonus skills"
                    : `Optional: Assess ${activeTrack.preferred.length} preferred skills or add custom skill`}
                </span>
              </button>

              {showBonusSkillsOnCheck && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeTrack.preferred.map((skill) => {
                      const currentSimple = normalizeSkillLevel(levels[skill]);
                      return (
                        <div
                          key={skill}
                          className="p-4 rounded-xl bg-[#FBF9F5] border border-[#141413]/15 flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-sm font-semibold text-[#141413]">{skill}</span>
                            <span className="block text-[10px] uppercase tracking-wider text-[#6E6B64]">
                              Preferred
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            {SIMPLE_SKILL_LEVELS.map((choice) => {
                              const selected = currentSimple === choice;
                              return (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() =>
                                    setLevels((prev) => ({ ...prev, [skill]: choice }))
                                  }
                                  className={`px-2.5 py-1.5 rounded text-xs font-semibold border cursor-pointer ${
                                    selected
                                      ? "bg-[#0F5C6E] text-white border-[#0F5C6E]"
                                      : "bg-[#FBF9F5] text-[#4A4843] border-[#141413]/20"
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

                  <form onSubmit={handleAddManualSkill} className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Add custom skill..."
                      className="px-3.5 py-2 text-xs bg-[#FBF9F5] border border-[#141413]/25 rounded-lg"
                    />
                    <select
                      value={newSkillTier}
                      onChange={(e) =>
                        setNewSkillTier(e.target.value as "Required" | "Preferred")
                      }
                      className="px-3 py-2 text-xs bg-[#FBF9F5] border border-[#141413]/25 rounded-lg"
                    >
                      <option value="Required">Required</option>
                      <option value="Preferred">Preferred</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#141413] text-[#FBF9F5] cursor-pointer"
                    >
                      + Add Skill
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#141413]/15">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A4843] hover:text-[#141413] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Goal</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
              >
                <span>Generate Action Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================
            SCREEN 4: ACTION PLAN
            Large readiness score, current-vs-target skill bars, top three gaps,
            and one practical project.
           ========================================================= */}
        {step === 3 && (
          <section className="space-y-10">
            {/* Editorial Header + Large Readiness Score */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-8 border-b border-[#141413]/15">
              <div className="lg:col-span-8 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F5C6E]">
                    04 / Action Plan · {form.branch.split(" (")[0]} · {form.year}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-[#F3EFE6] border border-[#141413]/15 text-[#2C2B29]">
                    {activeTrack.verificationStatusLabel}
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl text-[#141413] leading-tight">
                  {form.role}
                  {effectiveCompany ? ` — ${effectiveCompany}` : ""}
                </h1>
                <p className="text-sm text-[#4A4843] max-w-2xl">
                  {activeGuidance.executiveSummary}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handlePersonalizeWithGemini}
                    disabled={isPersonalizing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isPersonalizing ? "Personalizing..." : "Personalize with Gemini"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#141413]/20 text-[#2C2B29] hover:bg-[#F3EFE6] cursor-pointer"
                  >
                    Update Skill Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#141413] text-[#FBF9F5] hover:bg-[#2C2B29] cursor-pointer"
                  >
                    <span>4-Year Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {guidanceNotice && (
                  <p className="text-xs text-[#0F5C6E] font-medium pt-1">
                    {guidanceNotice.message}
                  </p>
                )}
              </div>

              {/* Large Editorial Readiness Score Block */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#F3EFE6] border border-[#141413]/15 flex flex-col justify-between space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#5C5953] font-semibold">
                    Role Skill Coverage
                  </span>
                  <span className="text-xs font-semibold text-[#0F5C6E]">
                    {gapAnalysis.readinessSignal.label}
                  </span>
                </div>
                <div className="font-serif text-5xl sm:text-6xl text-[#141413] tabular-nums">
                  {gapAnalysis.readiness}%
                </div>
                <div className="w-full h-2 bg-[#141413]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F5C6E] transition-all duration-300"
                    style={{ width: `${gapAnalysis.readiness}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[#5C5953] pt-1 border-t border-[#141413]/10">
                  <span>{gapAnalysis.requiredReadyCount} of {gapAnalysis.requiredTotalCount} core skills known</span>
                  <span className="font-mono">{gapAnalysis.highGapCount} high gaps</span>
                </div>
              </div>
            </div>

            {/* Top 3 Priority Gaps + Current-vs-Target Visual Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 5 Cols: Top Three Gaps */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border-b border-[#141413]/15 pb-3">
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#6E6B64]">
                    Priority Focus
                  </span>
                  <h2 className="font-serif text-2xl text-[#141413]">
                    Top Three Gaps to Close
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {topThreeGaps.map((gap, index) => {
                    const isExpanded = Boolean(expandedWhyRec[index]);
                    const tagColor =
                      gap.gapBand === "High gap"
                        ? "bg-[#F9E8E6] text-[#9E2A2B] border-[#9E2A2B]/25"
                        : gap.gapBand === "Medium gap"
                          ? "bg-[#FDF3E3] text-[#9A5B13] border-[#9A5B13]/25"
                          : "bg-[#E6F1F3] text-[#0F5C6E] border-[#0F5C6E]/25";

                    return (
                      <div
                        key={gap.skill}
                        className="p-5 rounded-xl bg-[#F3EFE6]/60 border border-[#141413]/15 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-[11px] uppercase tracking-wider text-[#6E6B64]">
                              0{index + 1} · {form.year} Priority
                            </span>
                            <h3 className="font-serif text-xl text-[#141413]">{gap.skill}</h3>
                          </div>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${tagColor}`}>
                            {gap.gapBand}
                          </span>
                        </div>

                        <p className="text-xs text-[#2C2B29]">
                          <strong>Missing:</strong> {gap.whatIsMissing}
                        </p>
                        <p className="text-xs text-[#4A4843]">
                          <strong>Evidence to create:</strong> {gap.expectedEvidence}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWhyRec((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                          className="text-xs font-semibold text-[#0F5C6E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          <span>Why this recommendation?</span>
                        </button>

                        {isExpanded && (
                          <div className="pt-2 border-t border-[#141413]/10 text-xs text-[#4A4843] space-y-1">
                            <p>{gap.whyItMatters}</p>
                            <p className="text-[#0F5C6E] font-medium">{gap.nextAction}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 7 Cols: Prioritized Current-vs-Target Skill Bars */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#141413]/15 pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#6E6B64]">
                      Visual Gap Analysis
                    </span>
                    <h2 className="font-serif text-2xl text-[#141413]">
                      Current vs. Target Skill Bars
                    </h2>
                  </div>

                  {/* Small Accessible Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-medium text-[#4A4843]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#B9382C]" />
                      High gap
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#C87A19]" />
                      Medium gap
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#0F5C6E]" />
                      Low gap
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#141413]/12 border border-[#141413]/15 rounded-xl bg-[#FBF9F5] px-5 py-2">
                  {gapAnalysis.skillGaps.map((item) => {
                    const barColor =
                      item.gapBand === "High gap"
                        ? "bg-[#B9382C]"
                        : item.gapBand === "Medium gap"
                          ? "bg-[#C87A19]"
                          : "bg-[#0F5C6E]";

                    return (
                      <div key={item.skill} className="py-3.5 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#141413]">
                              {item.skill}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F3EFE6] text-[#5C5953]">
                              {item.isRequired ? "Required" : "Preferred"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[11px] text-[#4A4843]">
                            <span>
                              {item.currentLevel} ({item.score}% / {item.targetScore}%)
                            </span>
                            <span className="font-sans font-semibold">{item.gapBand}</span>
                          </div>
                        </div>

                        <div className="relative h-2.5 w-full bg-[#E8E3D8] rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-[#141413]/10 border-r-2 border-[#141413]"
                            style={{ width: `${item.targetScore}%` }}
                            title={`Target: ${item.targetScore}%`}
                          />
                          <div
                            className={`relative h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${Math.max(5, item.score)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* One Practical Project Section */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F3EFE6] border border-[#141413]/15 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F5C6E]">
                  Recommended Portfolio Proof Project
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#141413]">
                  {activeGuidance.recommendedProject.title}
                </h2>
                <p className="text-sm text-[#4A4843] leading-relaxed">
                  {activeGuidance.recommendedProject.summary}
                </p>
                {activeGuidance.recommendedProject.resourceLinks.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {activeGuidance.recommendedProject.resourceLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FBF9F5] text-[#0F5C6E] border border-[#141413]/15 hover:border-[#0F5C6E]"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 p-5 rounded-xl bg-[#FBF9F5] border border-[#141413]/15 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#2C2B29]">
                  Build Milestones & Deliverable
                </div>
                <ul className="space-y-1.5 text-xs text-[#4A4843] list-disc list-inside">
                  {activeGuidance.recommendedProject.milestones.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#141413]/15">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A4843] hover:text-[#141413] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Skill Check</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
              >
                <span>View Four-Year BTech Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================
            SCREEN 5: ROADMAP
            Show the four-year BTech plan as an editorial timeline with clear sections for:
            skills, projects, internships, placement preparation, outputs, and evidence.
           ========================================================= */}
        {step === 4 && (
          <section className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#141413]/15">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F5C6E]">
                  05 / Four-Year BTech Roadmap · Adapted to {form.year}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#141413]">
                  Year-wise engineering preparation timeline.
                </h1>
                <p className="text-sm text-[#5C5953]">
                  Connecting your {form.role} target to every year of BTech across skills, projects, internships, placement prep, outputs, and evidence.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-[#141413]/20 text-[#2C2B29] hover:bg-[#F3EFE6] cursor-pointer"
                >
                  Back to Action Plan
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
                >
                  <span>Open Progress & Evidence</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Highlighted Active Year Priority Strip */}
            <div className="p-5 rounded-xl bg-[#E6F1F3] border border-[#0F5C6E]/30 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0F5C6E] font-semibold">
                  Active Stage · {form.year} ({currentYearStage.yearLabel})
                </span>
                <p className="text-sm font-semibold text-[#141413]">
                  Next 2 Priority Actions:{" "}
                  {(currentYearStage.priorityActions || currentYearStage.items.slice(0, 2)).join(
                    "  ·  "
                  )}
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#0F5C6E]">
                Target: {form.role}
              </span>
            </div>

            {/* Editorial Timeline for Years 1 to 4 */}
            <div className="relative pl-6 sm:pl-8 border-l border-[#141413]/25 space-y-8">
              {activeGuidance.yearPlan.map((yr, idx) => {
                const isCurrent = yr.statusForStudent === "Current Active Year";
                return (
                  <div
                    key={yr.yearLabel}
                    className={`relative p-6 rounded-2xl border transition-colors ${
                      isCurrent
                        ? "bg-[#F3EFE6] border-[#0F5C6E] shadow-xs"
                        : "bg-[#FBF9F5] border-[#141413]/15"
                    }`}
                  >
                    {/* Timeline Marker Dot */}
                    <span
                      className={`absolute -left-[31px] sm:-left-[39px] top-7 w-4 h-4 rounded-full border-2 ${
                        isCurrent
                          ? "bg-[#0F5C6E] border-[#FBF9F5] ring-2 ring-[#0F5C6E]"
                          : "bg-[#FBF9F5] border-[#141413]/40"
                      }`}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#141413]/12">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-[#0F5C6E] font-semibold">
                          0{idx + 1} · {yr.statusForStudent}
                        </span>
                        <h2 className="font-serif text-2xl text-[#141413]">{yr.yearLabel}</h2>
                      </div>
                      <span className="text-xs text-[#5C5953] max-w-md">{yr.objective}</span>
                    </div>

                    {/* 6 Clear Editorial Sections per Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6B64] block">
                          1. Skills
                        </span>
                        <p className="text-[#141413] font-medium">{yr.skillsFocus}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6B64] block">
                          2. Projects
                        </span>
                        <p className="text-[#141413] font-medium">{yr.projectsFocus}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6B64] block">
                          3. Internships
                        </span>
                        <p className="text-[#141413] font-medium">{yr.internshipActions}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6B64] block">
                          4. Placement Preparation
                        </span>
                        <p className="text-[#141413] font-medium">{yr.placementPrep}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6B64] block">
                          5. Measurable Outputs
                        </span>
                        <p className="text-[#141413] font-medium">{yr.measurableOutputs}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#0F5C6E] block font-semibold">
                          6. Evidence to Create
                        </span>
                        <p className="text-[#0F5C6E] font-semibold">{yr.evidenceToCreate}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#141413]/15">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A4843] hover:text-[#141413] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Action Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] transition-colors cursor-pointer"
              >
                <span>Continue to Progress & Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* =========================================================
            SCREEN 6: PROGRESS
            Show checkboxes, progress percentage, project evidence, and internship tracking.
           ========================================================= */}
        {step === 5 && (
          <section className="space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#141413]/15">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#0F5C6E]">
                  06 / Progress, Evidence & Applications
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#141413]">
                  Track your 30-day execution and proof.
                </h1>
                <p className="text-sm text-[#5C5953]">
                  Check off weekly tasks, link verifiable portfolio artifacts, and track internship or placement applications.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-[#F3EFE6] px-5 py-3 rounded-xl border border-[#141413]/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6B64] block">
                    30-Day Checklist
                  </span>
                  <span className="font-serif text-2xl text-[#141413] tabular-nums">
                    {thirtyDayCompletionPct}% Complete
                  </span>
                </div>
                <div className="w-24 h-2 bg-[#141413]/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F5C6E] transition-all duration-300"
                    style={{ width: `${thirtyDayCompletionPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Week 1–4 Structured Checklist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-[#141413]">
                  30-Day Action Checklist ({completedThirtyDayCount}/{allThirtyDayTasks.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeGuidance.thirtyDayPhases.map((phase) => (
                  <div
                    key={phase.id}
                    className="p-5 rounded-xl bg-[#F3EFE6]/60 border border-[#141413]/15 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#0F5C6E] font-semibold">
                        {phase.phaseLabel}
                      </span>
                      <h3 className="font-serif text-lg text-[#141413]">{phase.title}</h3>
                      <div className="space-y-2 pt-1">
                        {phase.tasks.map((t) => {
                          const isChecked = doneTasks.includes(t.task);
                          return (
                            <label
                              key={t.task}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-[#E6F1F3]/70 border-[#0F5C6E]/30 text-[#5C5953] line-through"
                                  : "bg-[#FBF9F5] border-[#141413]/15 text-[#141413]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTask(t.task)}
                                className="mt-0.5 accent-[#0F5C6E] cursor-pointer"
                              />
                              <span>{t.task}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#141413]/12 text-[11px] text-[#5C5953] space-y-1">
                      <div>
                        <strong className="text-[#141413]">Output:</strong> {phase.expectedOutput}
                      </div>
                      <div>
                        <strong className="text-[#0F5C6E]">Evidence:</strong> {phase.proofToPublish}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddCustomTask} className="flex flex-wrap gap-2 pt-1">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add custom milestone task..."
                  className="flex-1 min-w-[220px] px-3.5 py-2 text-xs bg-[#FBF9F5] border border-[#141413]/25 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#141413] text-[#FBF9F5] cursor-pointer"
                >
                  + Add Task
                </button>
              </form>
            </div>

            {/* Project Evidence Vault + Internship Application Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-[#141413]/15">
              {/* Project & Portfolio Evidence Links */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#6E6B64]">
                    Portfolio Proof
                  </span>
                  <h2 className="font-serif text-2xl text-[#141413]">Project Evidence Links</h2>
                </div>

                <div className="p-5 rounded-xl bg-[#F3EFE6]/60 border border-[#141413]/15 space-y-3 text-xs">
                  <label className="block space-y-1">
                    <span className="font-semibold text-[#2C2B29] flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-[#0F5C6E]" />
                      GitHub / CAD Repository URL
                    </span>
                    <input
                      type="url"
                      value={evidence.githubUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, githubUrl: e.target.value }))
                      }
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-[#2C2B29]">Live Demo / Simulation URL</span>
                    <input
                      type="url"
                      value={evidence.demoUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, demoUrl: e.target.value }))
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-[#2C2B29]">1-Page Résumé URL</span>
                    <input
                      type="url"
                      value={evidence.resumeUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, resumeUrl: e.target.value }))
                      }
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-[#2C2B29]">Certificate / Lab Verification URL</span>
                    <input
                      type="url"
                      value={evidence.certificateUrl}
                      onChange={(e) =>
                        setEvidence((prev) => ({ ...prev, certificateUrl: e.target.value }))
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    />
                  </label>
                </div>
              </div>

              {/* Internship & Placement Application Tracker */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#6E6B64]">
                    Opportunity Pipeline
                  </span>
                  <h2 className="font-serif text-2xl text-[#141413]">
                    Internship & Placement Tracker
                  </h2>
                </div>

                <div className="p-5 rounded-xl bg-[#F3EFE6]/60 border border-[#141413]/15 space-y-4 text-xs">
                  <form
                    onSubmit={handleAddApplication}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                  >
                    <input
                      type="text"
                      value={newAppCompany}
                      onChange={(e) => setNewAppCompany(e.target.value)}
                      placeholder="Company"
                      className="px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newAppRole}
                      onChange={(e) => setNewAppRole(e.target.value)}
                      placeholder="Role"
                      className="px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    />
                    <select
                      value={newAppStatus}
                      onChange={(e) =>
                        setNewAppStatus(e.target.value as ApplicationEntry["status"])
                      }
                      className="px-3 py-2 bg-[#FBF9F5] border border-[#141413]/20 rounded-lg"
                    >
                      <option value="Wishlist">Wishlist</option>
                      <option value="Building Proof">Building Proof</option>
                      <option value="Applied">Applied</option>
                      <option value="Online Assessment">Online Assessment</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg font-semibold bg-[#0F5C6E] text-white hover:bg-[#0B4654] cursor-pointer"
                    >
                      + Add Entry
                    </button>
                  </form>

                  <div className="divide-y divide-[#141413]/12 border border-[#141413]/15 rounded-xl bg-[#FBF9F5] overflow-hidden">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-sm text-[#141413]">
                            {app.company}
                          </span>{" "}
                          · <span className="text-[#4A4843]">{app.role}</span>
                          <div className="text-[11px] text-[#6E6B64]">
                            Proof linked: {app.evidenceShared}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded bg-[#E6F1F3] text-[#0F5C6E] font-semibold">
                            {app.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setApplications((prev) => prev.filter((x) => x.id !== app.id))
                            }
                            className="text-[#6E6B64] hover:text-[#9E2A2B] cursor-pointer"
                            aria-label="Delete application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
