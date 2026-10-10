export type SimpleSkillLevel = "Know it" | "Learning it" | "Need to learn";

export type SkillLevel =
  | SimpleSkillLevel
  | "Don’t know"
  | "Learning"
  | "Comfortable"
  | "Used in a project"
  | "Used in internship or real work";

export const SIMPLE_SKILL_LEVELS: SimpleSkillLevel[] = [
  "Know it",
  "Learning it",
  "Need to learn",
];

export const SKILL_LEVELS: SkillLevel[] = [
  "Know it",
  "Learning it",
  "Need to learn",
];

export function normalizeSkillLevel(level?: string): SimpleSkillLevel {
  if (!level) return "Need to learn";
  const l = level.trim().toLowerCase();
  if (
    l === "know it" ||
    l === "comfortable" ||
    l === "used in a project" ||
    l === "used in internship or real work"
  ) {
    return "Know it";
  }
  if (l === "learning it" || l === "learning") {
    return "Learning it";
  }
  return "Need to learn";
}

export const CURATED_BRANCHES: string[] = [
  "CSE (Computer Science & Engineering)",
  "CSE (AI/ML)",
  "CSE (Data Science)",
  "CSE (Cybersecurity)",
  "Information Technology (IT)",
  "ECE (Electronics & Communication)",
  "EEE (Electrical & Electronics)",
  "VLSI Design & Technology",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mechatronics & Robotics",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Instrumentation & Control",
  "Biotechnology / Biomedical",
  "Metallurgical & Materials Engineering",
  "Production & Industrial Engineering",
];

export const CURATED_ROLES: string[] = [
  "Backend Developer",
  "Frontend Developer",
  "Full-Stack Developer",
  "ML Engineer",
  "Data Analyst",
  "Data Engineer",
  "Embedded Systems Engineer",
  "VLSI Design Engineer",
  "DevOps / Cloud Engineer",
  "Cybersecurity Analyst",
  "Mechanical Design Engineer",
  "Civil / Structural Engineer",
  "Electrical / Power Systems Engineer",
  "Robotics & Control Engineer",
];

export const CURATED_COMPANIES: string[] = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Meta",
  "Adobe",
  "IBM",
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "Deloitte",
  "Qualcomm",
  "Nvidia",
  "Oracle",
  "Salesforce",
  "Flipkart",
  "Zomato",
  "Razorpay",
  "Zoho",
  "Other",
];

export interface SkillDetail {
  skill: string;
  tier: "Required" | "Preferred";
  whyItMatters: string;
  expectedEvidence: string;
  sourceSnippet: string;
}

export interface ResourceLink {
  label: string;
  url: string;
  whyUseful: string;
}

export interface TrackTask {
  task: string;
  reason: string;
  targetSkill: string;
}

export interface Track {
  roleProfileName: string;
  required: string[];
  preferred: string[];
  responsibilities: string[];
  expectedEvidence: string[];
  skillDetails: SkillDetail[];
  projectTitle: string;
  project: string;
  projectReason: string;
  projectMilestones: string[];
  projectLinks: ResourceLink[];
  tasks: TrackTask[];
  sourceType: "role-profile" | "jd-gemini" | "jd-deterministic";
  isCompanyVerified: boolean;
  verificationStatusLabel: string;
  sourceSummary: string;
  missingInformationNotes: string[];
  adaptationSummary: string;
}

export interface StudentForm {
  name: string;
  branch: string;
  year: "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
  goal: "Internship" | "Placement" | "Higher studies";
  companySelection: string;
  customCompany: string;
  role: string;
  skills: string;
  projects: string;
  jobSourceUrl: string;
  jdText: string;
}

export function getEffectiveCompany(form: StudentForm): string {
  if (form.companySelection === "Other") {
    return form.customCompany.trim();
  }
  return form.companySelection.trim();
}

export interface PortfolioEvidence {
  githubUrl: string;
  demoUrl: string;
  resumeUrl: string;
  certificateUrl: string;
  skillEvidenceMap: Record<string, string>;
}

export interface ApplicationEntry {
  id: string;
  company: string;
  role: string;
  locationOrMode: string;
  status:
    | "Wishlist"
    | "Building Proof"
    | "Applied"
    | "Online Assessment"
    | "Interview"
    | "Offer";
  deadlineOrDate: string;
  evidenceShared: string;
  notes: string;
}

export interface SkillGapItem {
  skill: string;
  isRequired: boolean;
  currentLevel: SimpleSkillLevel;
  score: number;
  targetScore: number;
  targetLevelLabel: string;
  gapPoints: number;
  gapBand: "High gap" | "Medium gap" | "Low gap";
  gapSeverity: "High gap" | "Medium gap" | "Review / Add proof" | "Strong proof";
  hasEvidence: boolean;
  evidenceUrl: string;
  whatIsMissing: string;
  whyItMatters: string;
  expectedEvidence: string;
  sourceSnippet: string;
  nextAction: string;
}

export interface DeterministicGapAnalysis {
  readiness: number;
  requiredReadiness: number;
  preferredReadiness: number;
  readyCount: number;
  requiredReadyCount: number;
  requiredTotalCount: number;
  totalCount: number;
  verifiedProofCount: number;
  highGapCount: number;
  mediumGapCount: number;
  lowGapCount: number;
  readinessSignal: {
    label: string;
    summary: string;
    tone: "emerald" | "amber" | "rose";
  };
  skillGaps: SkillGapItem[];
  formulaExplanation: string;
}

export interface GuidanceRecommendation {
  title: string;
  priority: string;
  targetSkills: string[];
  action: string;
  reason: string;
  proofDeliverable: string;
  yearConnection?: string;
}

export interface RoadmapPhase {
  id: string;
  phaseLabel: string;
  title: string;
  objective: string;
  tasks: TrackTask[];
  expectedOutput: string;
  proofToPublish: string;
}

export interface YearStagePlan {
  yearLabel: string;
  stageTitle: string;
  statusForStudent: "Completed Foundation" | "Current Active Year" | "Upcoming Milestone";
  focusNote: string;
  objective: string;
  skillsFocus: string;
  projectsFocus: string;
  internshipActions: string;
  placementPrep: string;
  measurableOutputs: string;
  evidenceToCreate: string;
  priorityActions: string[];
  items: string[];
  expectedOutput: string;
  proofToPublish: string;
}

export interface PersonalizedGuidance {
  executiveSummary: string;
  recommendations: GuidanceRecommendation[];
  recommendedProject: {
    title: string;
    summary: string;
    reason: string;
    milestones: string[];
    resourceLinks: ResourceLink[];
  };
  thirtyDayPhases: RoadmapPhase[];
  yearPlan: YearStagePlan[];
  thirtyDayTasks: TrackTask[];
  sourceMode: "gemini" | "deterministic-fallback" | "baseline";
}

export interface SampleStudentPreset {
  id: string;
  label: string;
  shortBranch: string;
  form: StudentForm;
  levels: Record<string, SkillLevel>;
  evidence: PortfolioEvidence;
  doneTasks: string[];
  applications: ApplicationEntry[];
}

export const SAMPLE_JDS: Record<string, string> = {
  "Backend Developer": `Role: Backend Developer Intern / New Grad
Responsibilities:
- Design, build, and maintain HTTP/REST APIs and backend services with clean request validation and error handling.
- Model relational schemas and optimize SQL queries for transactional workflows.
- Implement secure Authentication and session/token authorization flows.
- Collaborate via Git pull requests, write automated unit/integration tests, and support service deployment.
Required Qualifications:
- Strong foundation in Data structures and algorithmic problem solving.
- Working proficiency in one backend language (Java, Python, Go, C#, or Node.js/TypeScript).
- Solid understanding of HTTP/REST API conventions and status codes.
- Practical experience with SQL databases and Git version control.
Preferred Qualifications:
- Experience with Authentication (JWT, OAuth2, RBAC) and automated Testing.
- Familiarity with Deployment using Docker, Linux, or cloud hosting.`,

  "Frontend Developer": `Role: Frontend Developer
Responsibilities:
- Build responsive, accessible user interfaces using semantic HTML/CSS, JavaScript/TypeScript, and React.
- Integrate frontend state with backend REST APIs and handle loading, error, and empty states cleanly.
- Ensure WCAG Accessibility compliance, keyboard navigation, and cross-device layout quality.
Required Qualifications:
- Strong proficiency in HTML/CSS and modern layouts (Flexbox, CSS Grid).
- Solid command of JavaScript/TypeScript and component architecture in React.
- Awareness of web Accessibility standards and Git workflows.
Preferred Qualifications:
- Experience writing component/end-to-end Testing (Vitest, Jest, Playwright) and production Deployment.`,

  "ML Engineer": `Role: Machine Learning Engineer
Responsibilities:
- Build reproducible Data pipelines using Python and NumPy/pandas for feature preparation.
- Train, regularize, and benchmark models using Scikit-learn or PyTorch grounded in Statistics and Linear algebra basics.
- Run rigorous Model evaluation (precision/recall, ROC-AUC, calibration, error slicing) and track runs via Experiment tracking.
Required Qualifications:
- Strong programming proficiency in Python and NumPy/pandas.
- Solid foundation in Statistics and Linear algebra basics.
- Hands-on experience with Scikit-learn or PyTorch and quantitative Model evaluation.
Preferred Qualifications:
- Experience building automated Data pipelines and Experiment tracking (MLflow / Weights & Biases).`,

  "Data Analyst": `Role: Data Analyst
Responsibilities:
- Write complex SQL queries (joins, CTEs, window functions) and clean datasets in Python/pandas and Excel/Sheets.
- Apply Statistics to validate hypotheses, identify trends, and prevent misleading conclusions.
- Design clear Dashboards and communicate actionable business decisions to stakeholders.
Required Qualifications:
- Strong proficiency in SQL and Excel/Sheets for structured analysis.
- Solid grounding in Statistics and data manipulation with Python/pandas.
- Demonstrated ability to build Dashboards and deliver clear written/verbal Communication.
Preferred Qualifications:
- Experience with Power BI or Tableau and structured business case studies.`,

  "Embedded Systems Engineer": `Role: Embedded Systems & Firmware Engineer
Responsibilities:
- Write modular, memory-safe firmware in C/C++ for ARM Cortex-M / STM32 / ESP32 Microcontrollers.
- Interface peripheral sensors and actuators over UART/I2C/SPI protocols and verify bus timing.
- Perform systematic hardware/firmware Debugging and manage concurrent tasks using RTOS basics.
Required Qualifications:
- Strong proficiency in C/C++ for embedded systems and register-level programming.
- Hands-on experience with Microcontrollers and peripheral protocols (UART/I2C/SPI).
- Practical Debugging skills using serial logs, debug probes, or logic analyzers.
Preferred Qualifications:
- Working knowledge of RTOS basics (FreeRTOS tasks, queues, interrupts) and schematic/simulation tools.`,

  "Mechanical Design Engineer": `Role: Mechanical Design Engineer
Responsibilities:
- Create parametric 3D CAD parts and assemblies and produce standards-compliant 2D Engineering drawings.
- Perform first-principles load calculations and select appropriate Materials & manufacturing processes.
- Apply GD&T tolerances and validate structural safety factors using FEA simulation.
Required Qualifications:
- Proficiency in Engineering drawing and 3D CAD (SolidWorks, Fusion 360, CATIA, or Creo).
- Solid understanding of Materials & manufacturing and first-principles load calculations.
Preferred Qualifications:
- Experience with GD&T, FEA simulation (ANSYS), and Technical documentation.`,

  "Civil / Structural Engineer": `Role: Civil & Structural Engineer
Responsibilities:
- Perform structural load and equilibrium calculations using Engineering mechanics principles.
- Draft structural plans and 3D models using CAD or BIM (AutoCAD / Revit).
- Prepare accurate Quantity estimating (BOQ) sheets and verify compliance with Safety & building codes.
Required Qualifications:
- Strong foundation in Engineering mechanics, CAD or BIM (AutoCAD/Revit), Quantity estimating (BOQ), and Safety & building codes.
Preferred Qualifications:
- Exposure to Structural analysis software (STAAD.Pro/ETABS), Surveying, and Project scheduling.`,
};

// Canonical knowledge base for individual skills (Why it matters + Expected Evidence)
const SKILL_KNOWLEDGE_BASE: Record<
  string,
  { whyItMatters: string; expectedEvidence: string }
> = {
  "Data structures": {
    whyItMatters:
      "Core filter in technical assessments and essential for choosing memory- and latency-efficient collections in backend services.",
    expectedEvidence:
      "GitHub repository or problem-solving log demonstrating trees, graphs, hashing, and complexity trade-offs applied in code.",
  },
  "HTTP/REST": {
    whyItMatters:
      "Every backend service communicates over HTTP; engineers must design predictable endpoints, status codes, idempotency, and pagination.",
    expectedEvidence:
      "Working API project with documented REST routes, request/response schemas, proper 4xx/5xx error handling, and OpenAPI/Postman specs.",
  },
  "One backend language": {
    whyItMatters:
      "Production services require fluency in at least one server-side runtime (Java, Python, Go, C#, or Node.js/TypeScript) beyond syntax.",
    expectedEvidence:
      "Modular multi-file backend codebase demonstrating clean architecture, concurrency/async handling, and dependency management.",
  },
  "SQL": {
    whyItMatters:
      "Relational databases back most business systems; engineers and analysts must write joins, indexes, transactions, and window functions.",
    expectedEvidence:
      "Normalized schema diagram (`schema.sql`), migration scripts, and documented analytical or transactional SQL queries.",
  },
  "Authentication": {
    whyItMatters:
      "Real-world APIs must protect user data via password hashing, session/JWT management, and role-based access control (RBAC).",
    expectedEvidence:
      "Implemented login/session or JWT middleware with protected routes, input sanitization, and permission checks in a project.",
  },
  "Git": {
    whyItMatters:
      "Engineering teams collaborate through branches, atomic commits, pull requests, and merge conflict resolution.",
    expectedEvidence:
      "Public GitHub repository with a clean multi-commit history, descriptive commit messages, and structured README.",
  },
  "Testing": {
    whyItMatters:
      "Untested code breaks in production; unit and integration tests prove your system handles edge cases and regressions.",
    expectedEvidence:
      "Automated test suite (Pytest, JUnit, Vitest/Jest) running in your repository with passing test cases for happy and error paths.",
  },
  "Deployment": {
    whyItMatters:
      "Shipping code to a live environment (Docker, cloud VM, Render/Fly/Vercel, or CI/CD) proves end-to-end engineering ownership.",
    expectedEvidence:
      "Live reachable URL or `Dockerfile` + CI workflow with reproducible setup instructions in the README.",
  },
  "Python": {
    whyItMatters:
      "Universal language for machine learning, data engineering, automation, and rapid backend API development.",
    expectedEvidence:
      "Clean, PEP8-structured Python modules (not just untitled notebooks) with `requirements.txt` and type hints.",
  },
  "Statistics": {
    whyItMatters:
      "Prevents false discoveries; essential for hypothesis testing, confidence intervals, distributions, and experimental validity.",
    expectedEvidence:
      "Case study or notebook section computing statistical significance, variance/bias analysis, or distribution checks on real data.",
  },
  "Linear algebra basics": {
    whyItMatters:
      "Vectors, matrices, eigenvalues, and dot products underpin embeddings, neural network weights, PCA, and optimization.",
    expectedEvidence:
      "Implemented matrix/vector operations, dimensionality reduction (PCA/cosine similarity), or custom layer math in code.",
  },
  "NumPy/pandas": {
    whyItMatters:
      "Vectorized array and DataFrame operations are mandatory for cleaning, transforming, and aggregating datasets efficiently.",
    expectedEvidence:
      "Data preprocessing pipeline using vectorized NumPy/pandas transformations without slow row-by-row Python loops.",
  },
  "Scikit-learn or PyTorch": {
    whyItMatters:
      "Standard industry frameworks for classical tabular modeling (Scikit-learn) and deep neural networks (PyTorch).",
    expectedEvidence:
      "Reproducible training script comparing baseline vs. tuned models with saved model weights and inference script.",
  },
  "Model evaluation": {
    whyItMatters:
      "Raw accuracy is misleading on imbalanced data; recruiters probe precision/recall, ROC-AUC, cross-validation, and error analysis.",
    expectedEvidence:
      "Evaluation report in README showing confusion matrix, precision/recall curves, and analysis of specific failure cases.",
  },
  "Data pipelines": {
    whyItMatters:
      "Models and analytics are only as reliable as the ingestion, validation, and feature transformation pipelines feeding them.",
    expectedEvidence:
      "Modular ETL/data preparation script that ingests raw data, handles missing/corrupt records, and outputs clean features.",
  },
  "Experiment tracking": {
    whyItMatters:
      "Systematic ML engineering requires logging hyperparameters, dataset versions, and metrics across runs (MLflow, W&B, or structured CSV logs).",
    expectedEvidence:
      "Experiment comparison table or MLflow/W&B dashboard link comparing at least 3 model iterations and hyperparameter choices.",
  },
  "Excel/Sheets": {
    whyItMatters:
      "Ubiquitous business tool for rapid pivot tables, financial/operational modeling, lookup formulas, and stakeholder handoffs.",
    expectedEvidence:
      "Shared spreadsheet or workbook demonstrating pivot tables, XLOOKUP/INDEX-MATCH, conditional formatting, and summary metrics.",
  },
  "Python/pandas": {
    whyItMatters:
      "Enables repeatable data cleaning, multi-source merging, and exploratory analysis beyond spreadsheet row limits.",
    expectedEvidence:
      "Documented Python/pandas script or notebook cleaning a real-world dataset and exporting validated tables.",
  },
  "Dashboards": {
    whyItMatters:
      "Decision-makers need interactive visual summaries of KPIs, trends, and cohort filters rather(than raw SQL dumps.",
    expectedEvidence:
      "Published interactive dashboard (Power BI, Tableau Public, Looker Studio, or Streamlit) with clear KPI hierarchy.",
  },
  "Communication": {
    whyItMatters:
      "Technical output only creates value when you can explain assumptions, trade-offs, and actionable recommendations clearly.",
    expectedEvidence:
      "Structured executive summary or README case study explaining the problem, methodology, and 3 concrete decisions.",
  },
  "HTML/CSS": {
    whyItMatters:
      "Semantic HTML and responsive CSS (Flexbox, Grid) form the structural and visual foundation of every web application.",
    expectedEvidence:
      "Responsive multi-screen web UI that works cleanly across desktop and mobile viewports without layout overflow.",
  },
  "JavaScript/TypeScript": {
    whyItMatters:
      "Core language of the web; TypeScript adds static type safety that prevents runtime bugs in complex frontend/fullstack apps.",
    expectedEvidence:
      "Type-safe TypeScript/JavaScript project handling async API fetching, state updates, and DOM events cleanly.",
  },
  "React": {
    whyItMatters:
      "Dominant component architecture for modern web interfaces, state management, hooks, and client-side routing.",
    expectedEvidence:
      "Deployed React application with reusable components, custom hooks, controlled forms, and persistent/API state.",
  },
  "Accessibility": {
    whyItMatters:
      "Production interfaces must be usable by everyone via semantic landmarks, ARIA labels, keyboard focus, and WCAG contrast.",
    expectedEvidence:
      "Frontend project verified with keyboard-only navigation, visible focus states, semantic labels, and Lighthouse accessibility audit.",
  },
  "C/C++": {
    whyItMatters:
      "Deterministic memory layout, bitwise operations, and pointer manipulation in C/C++ are mandatory for firmware and embedded systems.",
    expectedEvidence:
      "Clean C/C++ firmware repository demonstrating register manipulation, header modularity, and interrupt-safe structures.",
  },
  "Microcontrollers": {
    whyItMatters:
      "Embedded engineers must configure clocks, GPIOs, timers, ADCs, and interrupts on real MCUs (STM32, ARM Cortex-M, ESP32, AVR).",
    expectedEvidence:
      "Hardware prototype or Wokwi/Proteus simulation configuring MCU peripherals directly from datasheet specifications.",
  },
  "UART/I2C/SPI": {
    whyItMatters:
      "Sensors, displays, and external flash chips communicate over serial buses; engineers must understand framing, addressing, and clock polarity.",
    expectedEvidence:
      "Working sensor/peripheral driver over UART, I2C, or SPI with waveform capture or serial telemetry logs.",
  },
  "Debugging": {
    whyItMatters:
      "Embedded and software systems fail in subtle ways; methodical debugging via GDB, SWD/JTAG, UART logs, or logic analyzers is critical.",
    expectedEvidence:
      "Root-cause debugging log or test report documenting how a timing, memory, or bus issue was isolated and fixed.",
  },
  "RTOS basics": {
    whyItMatters:
      "Real-time systems require concurrent task scheduling, queues, semaphores, and deterministic deadline management (e.g., FreeRTOS).",
    expectedEvidence:
      "Multi-tasking FreeRTOS project separating sensor acquisition, processing, and telemetry into prioritized tasks.",
  },
  "Digital fundamentals": {
    whyItMatters:
      "Combinational/sequential logic, state machines, and ADC/DAC quantization govern all hardware-software interfaces.",
    expectedEvidence:
      "State machine diagram, digital timing analysis, or Verilog/logic simulation artifact.",
  },
  "Engineering drawing": {
    whyItMatters:
      "Universal language of mechanical fabrication; machinists rely on accurate orthographic views, sections, and dimensioning.",
    expectedEvidence:
      "Standards-compliant 2D manufacturing drawing PDF with title block, section views, and Bill of Materials (BOM).",
  },
  "3D CAD (SolidWorks/Fusion 360)": {
    whyItMatters:
      "Parametric 3D modeling is required to design parts, check assembly interferences, and prepare files for CNC/3D printing.",
    expectedEvidence:
      "Fully constrained parametric 3D CAD assembly (GrabCAD link or STEP/PDF pack) with motion/interference verification.",
  },
  "Materials & manufacturing": {
    whyItMatters:
      "Designs must account for material yield strength, weight, cost, and Design for Manufacturability (DFM).",
    expectedEvidence:
      "Design justification table comparing candidate materials (e.g., Al 6061 vs. Mild Steel) and manufacturing process selection.",
  },
  "First-principles load calculations": {
    whyItMatters:
      "Engineers must calculate forces, torque, bending stress, and Factor of Safety by hand before trusting software simulations.",
    expectedEvidence:
      "Documented free-body diagram (FBD) and hand calculation sheet verifying stress and deflection limits.",
  },
  "GD&T": {
    whyItMatters:
      "Geometric Dimensioning & Tolerancing ensures parts manufactured within tolerance actually assemble and function properly.",
    expectedEvidence:
      "2D drawing featuring datum reference frames, flatness/position callouts, and shaft-hole fit calculations.",
  },
  "FEA simulation (ANSYS)": {
    whyItMatters:
      "Finite Element Analysis validates stress concentrations, thermal loads, and natural frequencies prior to physical tooling.",
    expectedEvidence:
      "FEA report showing boundary conditions, mesh convergence check, Von Mises stress plot, and Factor of Safety.",
  },
  "Engineering mechanics": {
    whyItMatters:
      "Statics, strength of materials, shear force, and bending moment diagrams are foundational for all civil/structural design.",
    expectedEvidence:
      "Structural calculation sheet showing load path, SFD/BMD diagrams, and member sizing.",
  },
  "CAD or BIM (AutoCAD/Revit)": {
    whyItMatters:
      "Civil and structural projects require coordinated 2D plans, reinforcement detailing, and 3D Building Information Models.",
    expectedEvidence:
      "AutoCAD plan/section drawings or Revit 3D BIM model with structural schedules.",
  },
  "Quantity estimating (BOQ)": {
    whyItMatters:
      "Every infrastructure project requires accurate Bill of Quantities, material take-offs, and cost estimation.",
    expectedEvidence:
      "Detailed Excel BOQ and rate analysis sheet computed from your structural drawing dimensions.",
  },
  "Safety & building codes": {
    whyItMatters:
      "Structural designs must strictly comply with national safety standards (IS 456, IS 800, NBC, Eurocode) for limit states.",
    expectedEvidence:
      "Design report citing specific code clauses for load combinations, cover, deflection, and reinforcement checks.",
  },
  "Structural analysis": {
    whyItMatters:
      "Analyzing multi-bay frames and trusses under dead, live, wind, and seismic loads is central to structural engineering.",
    expectedEvidence:
      "STAAD.Pro / ETABS or hand-verified frame analysis report with axial, shear, and moment envelopes.",
  },
};

export function getSkillDetail(
  skill: string,
  tier: "Required" | "Preferred",
  role: string,
  sourceSnippet?: string
): SkillDetail {
  const exact = SKILL_KNOWLEDGE_BASE[skill];
  const matchedKey =
    !exact &&
    Object.keys(SKILL_KNOWLEDGE_BASE).find(
      (k) =>
        k.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(k.toLowerCase())
    );
  const entry = exact || (matchedKey ? SKILL_KNOWLEDGE_BASE[matchedKey] : undefined);

  return {
    skill,
    tier,
    whyItMatters: entry
      ? entry.whyItMatters
      : `${tier} competency for ${role}; directly evaluated in technical screening and project reviews.`,
    expectedEvidence: entry
      ? entry.expectedEvidence
      : `Published GitHub repository, technical report, or live demo demonstrating ${skill} in a realistic ${role} workflow.`,
    sourceSnippet: sourceSnippet || `Explicit Role Profile (${role})`,
  };
}

interface RawRoleProfile {
  roleProfileName: string;
  required: string[];
  preferred: string[];
  responsibilities: string[];
  expectedEvidence: string[];
  projectTitle: string;
  project: string;
  projectReason: string;
  projectMilestones: string[];
  projectLinks: ResourceLink[];
}

function getRawRoleProfile(role: string, branch: string): RawRoleProfile {
  const r = role.toLowerCase();
  const b = branch.toLowerCase();

  // 1. Backend Developer (Exact match to prompt specification)
  if (r.includes("backend")) {
    return {
      roleProfileName: "Backend Developer",
      required: [
        "Data structures",
        "HTTP/REST",
        "One backend language",
        "SQL",
        "Authentication",
        "Git",
      ],
      preferred: ["Testing", "Deployment"],
      responsibilities: [
        "Design and build scalable HTTP/REST APIs with clean request validation and status codes",
        "Model relational schemas, write indexed SQL queries, and maintain transactional integrity",
        "Implement secure Authentication (JWT/session/OAuth) and role-based authorization",
        "Write automated unit/integration tests, collaborate via Git PRs, and deploy containerized services",
      ],
      expectedEvidence: [
        "GitHub repository of a multi-route REST API written in one backend language (Java, Python, Go, or Node/TS)",
        "Relational SQL schema diagram + migration files with join/index query examples",
        "Working Authentication flow (protected routes + password hashing) and passing automated test suite",
        "Live deployed API endpoint or Docker Compose setup with OpenAPI/Postman documentation",
      ],
      projectTitle: "Production-Grade REST API Service with SQL Persistence, Auth, Tests & Deployment",
      project:
        "Build a complete backend service (e.g., campus resource booking, issue tracker, or payment ledger API) featuring normalized SQL tables, JWT/session authentication, automated integration tests, and cloud/Docker deployment.",
      projectReason:
        "Backend hiring screens immediately filter out CRUD tutorials that lack authentication, relational SQL constraints, and automated tests.",
      projectMilestones: [
        "Design a 4-table normalized SQL schema and implement core CRUD + filtering endpoints over HTTP/REST",
        "Add secure Authentication & role-based access control protecting write/admin endpoints",
        "Write 10+ automated unit and API integration tests verifying edge cases and invalid inputs",
        "Containerize or deploy the service and document API endpoints, latency, and trade-offs in the GitHub README",
      ],
      projectLinks: [
        {
          label: "MDN HTTP & REST Status Codes Reference",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
          whyUseful: "Essential reference for HTTP methods, headers, caching, and status semantics.",
        },
        {
          label: "PostgreSQL Official Tutorial & Indexing",
          url: "https://www.postgresql.org/docs/current/tutorial.html",
          whyUseful: "Learn relational modeling, joins, transactions, and query performance.",
        },
        {
          label: "OWASP Authentication Cheat Sheet",
          url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
          whyUseful: "Industry best practices for implementing password storage, sessions, and tokens safely.",
        },
      ],
    };
  }

  // 2. Frontend Developer (Exact match to prompt specification)
  if (r.includes("frontend") || r.includes("front-end") || r.includes("ui")) {
    return {
      roleProfileName: "Frontend Developer",
      required: ["HTML/CSS", "JavaScript/TypeScript", "React", "Accessibility", "Git"],
      preferred: ["Testing", "Deployment"],
      responsibilities: [
        "Build responsive, high-craft user interfaces using semantic HTML/CSS, TypeScript, and React",
        "Manage complex client state, asynchronous API integration, and loading/error/empty states",
        "Ensure WCAG Accessibility compliance, keyboard navigation, and responsive performance",
        "Write automated component tests and deploy production builds via modern CI/CD",
      ],
      expectedEvidence: [
        "Live deployed React + TypeScript web application solving a real interactive workflow",
        "Clean GitHub repo demonstrating reusable components, custom hooks, and responsive CSS Grid/Flexbox",
        "Accessibility verification (keyboard-navigable controls, semantic landmarks, WCAG contrast)",
        "Automated component or end-to-end tests verifying key user journeys",
      ],
      projectTitle: "Accessible, Type-Safe React Web Application with Live API State & Component Tests",
      project:
        "Build and deploy an interactive React + TypeScript web application with search/filtering, persistent state, keyboard accessibility, and automated component tests.",
      projectReason:
        "Frontend interviews evaluate your mastery of state management, semantic HTML/CSS layout resilience, accessibility, and clean component boundaries.",
      projectMilestones: [
        "Architect a responsive layout in semantic HTML/CSS and modular React + TypeScript components",
        "Implement client-side filtering, form validation, and resilient loading/empty/error states",
        "Audit keyboard focus order, ARIA labels, and color contrast for full Accessibility compliance",
        "Add automated tests (Vitest/Testing Library) and publish a live production Deployment link",
      ],
      projectLinks: [
        {
          label: "React Official Documentation (react.dev)",
          url: "https://react.dev/learn",
          whyUseful: "Canonical guide for modern React hooks, state architecture, and effects.",
        },
        {
          label: "W3C WAI-ARIA Authoring Practices",
          url: "https://www.w3.org/WAI/ARIA/apg/",
          whyUseful: "Authoritative patterns for building accessible comboboxes, modals, and tabs.",
        },
        {
          label: "MDN TypeScript & Modern JavaScript Guide",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          whyUseful: "Deep dive into closures, promises, event loop, and DOM APIs.",
        },
      ],
    };
  }

  // 3. ML Engineer (Exact match to prompt specification)
  if (r.includes("ml") || r.includes("machine learning") || r.includes("ai")) {
    return {
      roleProfileName: "ML Engineer",
      required: [
        "Python",
        "Statistics",
        "Linear algebra basics",
        "NumPy/pandas",
        "Scikit-learn or PyTorch",
        "Model evaluation",
      ],
      preferred: ["Data pipelines", "Experiment tracking", "Model deployment / APIs"],
      responsibilities: [
        "Build reproducible Data pipelines in Python and NumPy/pandas to clean and engineer features",
        "Train and optimize models in Scikit-learn or PyTorch grounded in Statistics and Linear algebra basics",
        "Conduct rigorous Model evaluation (precision/recall, ROC-AUC, cross-validation, failure-mode slicing)",
        "Log hyperparameters and metrics via Experiment tracking and package models for inference",
      ],
      expectedEvidence: [
        "Modular Python ML repository (beyond a single messy notebook) using NumPy/pandas and Scikit-learn or PyTorch",
        "Quantitative Model evaluation report comparing baseline vs. improved models with error analysis",
        "Reproducible Data pipeline script and Experiment tracking table/dashboard showing hyperparameter ablations",
        "Live interactive demo or inference API endpoint with documented model limitations",
      ],
      projectTitle: "End-to-End ML System with Reproducible Data Pipeline, Experiment Tracking & Error Analysis",
      project:
        "Build a modular machine learning system in Python (Scikit-learn or PyTorch) with an automated NumPy/pandas data pipeline, tracked experiments across 3+ model architectures, rigorous precision/recall/error slicing, and an interactive demo.",
      projectReason:
        "ML hiring committees reject notebook-only projects that report a single accuracy number without baseline comparisons, data leakage checks, and error analysis.",
      projectMilestones: [
        "Build a clean NumPy/pandas Data pipeline with train/validation/test split and leakage prevention",
        "Train a simple statistical baseline and 2 Scikit-learn or PyTorch models, logging runs via Experiment tracking",
        "Perform deep Model evaluation (precision-recall, confusion matrix, slice analysis on worst-performing cohorts)",
        "Package the best model into a clean inference script/API and publish an engineering README with findings",
      ],
      projectLinks: [
        {
          label: "Scikit-Learn User Guide & Evaluation Metrics",
          url: "https://scikit-learn.org/stable/user_guide.html",
          whyUseful: "Rigorous documentation on cross-validation, pipelines, and evaluation metrics.",
        },
        {
          label: "PyTorch Tutorials & Model Training",
          url: "https://pytorch.org/tutorials/",
          whyUseful: "Hands-on guides for tensors, autograd, neural net training loops, and deployment.",
        },
        {
          label: "Made With ML — MLOps & Experiment Tracking",
          url: "https://madewithml.com/",
          whyUseful: "Best-in-class reference for structuring production-grade ML codebases and experiments.",
        },
      ],
    };
  }

  // 4. Data Engineer
  if (r.includes("data engineer")) {
    return {
      roleProfileName: "Data Engineer",
      required: ["SQL", "Python/pandas", "Data pipelines", "Data structures", "Git"],
      preferred: ["Testing", "Deployment", "Dashboards"],
      responsibilities: [
        "Design automated ETL/ELT Data pipelines in Python and SQL to ingest and transform raw datasets",
        "Model analytical warehouse tables and optimize complex SQL queries and partitions",
        "Implement data quality checks, schema validation, and automated pipeline Testing",
      ],
      expectedEvidence: [
        "GitHub repo containing an automated Python + SQL data pipeline ingesting real multi-source data",
        "Warehouse schema design (star/snowflake schema) with optimized analytical SQL queries",
        "Data quality validation tests and summary Dashboard proving pipeline reliability",
      ],
      projectTitle: "Automated Python & SQL ETL Pipeline with Data Quality Checks & Warehouse Schema",
      project:
        "Build an automated data pipeline that ingests raw public API/CSV data using Python/pandas, validates schema quality, loads transformed tables into SQL, and surfaces operational metrics.",
      projectReason:
        "Data Engineering interviews test your ability to write idempotent pipelines, handle corrupt records, and optimize SQL schemas.",
      projectMilestones: [
        "Design a relational/analytical SQL schema and ingest raw data using Python/pandas",
        "Add automated data validation checks (null thresholds, duplicate detection, schema checks)",
        "Write optimized SQL transformations using CTEs and window functions",
        "Containerize/schedule the pipeline and document architecture and throughput on GitHub",
      ],
      projectLinks: [
        {
          label: "PostgreSQL Performance & Indexing Docs",
          url: "https://www.postgresql.org/docs/current/performance-tips.html",
          whyUseful: "Learn query execution plans, EXPLAIN ANALYZE, and indexing strategies.",
        },
        {
          label: "Pandas Data Manipulation Documentation",
          url: "https://pandas.pydata.org/docs/user_guide/index.html",
          whyUseful: "Master vectorized transformations, merges, and time-series handling.",
        },
      ],
    };
  }

  // 5. Data Analyst (Exact match to prompt specification)
  if (r.includes("data analyst") || r.includes("business analyst") || r.includes("analytics")) {
    return {
      roleProfileName: "Data Analyst",
      required: [
        "SQL",
        "Excel/Sheets",
        "Statistics",
        "Python/pandas",
        "Dashboards",
        "Communication",
      ],
      preferred: ["Power BI or Tableau", "Data cleaning & validation"],
      responsibilities: [
        "Query multi-table relational databases using advanced SQL (joins, CTEs, window functions)",
        "Clean, audit, and analyze datasets using Excel/Sheets and Python/pandas",
        "Apply Statistics to validate trends, cohort behavior, and business hypotheses",
        "Build interactive Dashboards and deliver clear written and verbal Communication of insights",
      ],
      expectedEvidence: [
        "SQL script repository demonstrating complex joins, aggregations, and window functions on a realistic dataset",
        "Python/pandas data cleaning notebook and structured Excel/Sheets model",
        "Live interactive Dashboard (Power BI, Tableau Public, or Streamlit) tracking actionable KPIs",
        "Written executive case study demonstrating clear Communication with 3 quantified recommendations",
      ],
      projectTitle: "Multi-Table SQL & Python Analytics Case Study with Interactive KPI Dashboard",
      project:
        "Analyze a multi-table business or public dataset using SQL and Python/pandas, validate findings with Statistics and Excel/Sheets checks, build an interactive Dashboard, and publish a 3-decision case study.",
      projectReason:
        "Data Analyst interviews test SQL fluency first, followed by your ability to translate statistical findings into clear business decisions.",
      projectMilestones: [
        "Load a multi-table dataset into SQL and write 8+ queries using joins, CTEs, and window functions",
        "Clean anomalies using Python/pandas and cross-check summary pivots in Excel/Sheets",
        "Design an interactive Dashboard highlighting core KPIs, cohorts, and statistical trends",
        "Write a concise case study README explaining 3 concrete decisions and their quantified impact",
      ],
      projectLinks: [
        {
          label: "Mode SQL Analytics Tutorial",
          url: "https://mode.com/sql-tutorial/",
          whyUseful: "Practical guide to analytical SQL, window functions, and cohort queries.",
        },
        {
          label: "Pandas Official Getting Started Tutorials",
          url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html",
          whyUseful: "Learn repeatable data cleaning, grouping, and reshaping in Python.",
        },
        {
          label: "Tableau Public / Power BI Guided Learning",
          url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
          whyUseful: "Official modules for building executive-ready analytical dashboards.",
        },
      ],
    };
  }

  // 6. VLSI Design Engineer
  if (r.includes("vlsi") || r.includes("asic") || r.includes("fpga") || r.includes("rtl")) {
    return {
      roleProfileName: "VLSI Design Engineer",
      required: [
        "Digital fundamentals",
        "Verilog / SystemVerilog",
        "CMOS fundamentals",
        "Static Timing Analysis (STA)",
        "Simulation & testbenches",
      ],
      preferred: ["FPGA prototyping", "Tcl / Python scripting", "C/C++"],
      responsibilities: [
        "Write synthesizable RTL in Verilog / SystemVerilog for digital subsystems and FSMs",
        "Verify logic correctness using self-checking Simulation & testbenches and waveform analysis",
        "Analyze setup/hold timing paths and clock domain crossings using Static Timing Analysis (STA)",
      ],
      expectedEvidence: [
        "GitHub repository with synthesizable Verilog/SystemVerilog RTL modules (e.g., pipelined RISC-V core, FIFO, or UART/SPI controller)",
        "Self-checking testbench code and simulation waveform screenshots proving corner-case verification",
        "Synthesis timing/utilization report or FPGA prototyping demo",
      ],
      projectTitle: "Synthesizable Verilog/SystemVerilog IP Core with Self-Checking Testbench & Timing Report",
      project:
        "Design, simulate, and synthesize a digital hardware block (such as an asynchronous FIFO, pipelined ALU/RISC-V stage, or APB/AXI peripheral) with a self-checking testbench and timing analysis.",
      projectReason:
        "VLSI recruiters heavily test synthesizable RTL coding styles, FSM design, setup/hold timing equations, and verification rigor.",
      projectMilestones: [
        "Define micro-architecture block diagram, state machines, and interface timing specification",
        "Write clean, synthesizable Verilog/SystemVerilog RTL without unintended latches",
        "Build a self-checking testbench verifying corner cases and capture simulation waveforms",
        "Run FPGA/open-source synthesis (Vivado / Yosys / OpenLane) and document area & timing results",
      ],
      projectLinks: [
        {
          label: "HDLBits — Verilog Practice Problems",
          url: "https://hdlbits.01xz.net/wiki/Main_Page",
          whyUseful: "Hands-on digital logic, combinational/sequential circuits, and FSM synthesis exercises.",
        },
        {
          label: "ChipVerify — SystemVerilog & Verification",
          url: "https://www.chipverify.com/",
          whyUseful: "Clear tutorials on SystemVerilog constructs, testbenches, and assertions.",
        },
      ],
    };
  }

  // 7. Embedded Systems Engineer (Exact match to prompt specification)
  if (
    r.includes("embedded") ||
    r.includes("firmware") ||
    r.includes("microcontroller") ||
    (r.includes("iot") && !r.includes("cloud")) ||
    (b.includes("ece") && r.includes("core"))
  ) {
    return {
      roleProfileName: "Embedded Systems Engineer",
      required: ["C/C++", "Microcontrollers", "UART/I2C/SPI", "Debugging", "Digital fundamentals"],
      preferred: ["RTOS basics", "PCB or simulation tools"],
      responsibilities: [
        "Develop memory-efficient, interrupt-safe firmware in C/C++ for Microcontrollers (STM32, ARM Cortex-M, ESP32)",
        "Write peripheral drivers and interface sensors/actuators over UART/I2C/SPI buses",
        "Perform hardware/firmware Debugging using serial telemetry, debug probes, or logic analyzers",
        "Structure deterministic multi-tasking workflows using RTOS basics",
      ],
      expectedEvidence: [
        "GitHub repository containing modular C/C++ firmware (register/HAL level, avoiding monolithic loop code)",
        "Demonstrated UART/I2C/SPI communication with real hardware or a shareable Wokwi/Proteus simulation link",
        "RTOS task/queue architecture diagram and Debugging verification logs (timing/waveform screenshots)",
      ],
      projectTitle: "Multi-Sensor Microcontroller Firmware with UART/I2C/SPI Drivers & RTOS Task Scheduling",
      project:
        "Build a deterministic embedded system in C/C++ (on physical STM32/ESP32 hardware or Wokwi simulator) that interfaces sensors over I2C/SPI, manages concurrent tasks using FreeRTOS basics, streams telemetry over UART, and documents debugging waveforms.",
      projectReason:
        "Embedded interviewers probe pointers/volatile in C/C++, interrupt latency, UART/I2C/SPI protocol framing, and RTOS synchronization.",
      projectMilestones: [
        "Configure MCU clocks, GPIO interrupts, and hardware timers in C/C++ from datasheet specs",
        "Implement a modular I2C or SPI sensor driver and UART telemetry logger with error handling",
        "Refactor blocking delays into concurrent FreeRTOS tasks communicating via queues/mutexes",
        "Document schematic, memory footprint, and Debugging/logic analyzer captures in your GitHub README",
      ],
      projectLinks: [
        {
          label: "FreeRTOS Kernel Official Documentation",
          url: "https://www.freertos.org/Documentation/02-Kernel/01-About-the-FreeRTOS-kernel",
          whyUseful: "Master RTOS tasks, queues, semaphores, and interrupt-safe APIs.",
        },
        {
          label: "Wokwi STM32 / ESP32 Online Simulator",
          url: "https://wokwi.com/",
          whyUseful: "Build, debug, and share live microcontroller + I2C/SPI logic analyzer projects.",
        },
      ],
    };
  }

  // 8. DevOps / Cloud Engineer
  if (r.includes("devops") || r.includes("cloud") || r.includes("sre")) {
    return {
      roleProfileName: "DevOps / Cloud Engineer",
      required: ["Linux & Bash", "Docker & containers", "CI/CD pipelines", "Git", "HTTP/REST"],
      preferred: ["Deployment", "Infrastructure as Code (Terraform)", "Monitoring & logs"],
      responsibilities: [
        "Containerize applications using Docker and automate build/test/deploy CI/CD pipelines",
        "Administer Linux environments, networking, and Bash automation scripts",
        "Provision reproducible cloud infrastructure and monitor service health and logs",
      ],
      expectedEvidence: [
        "GitHub repository with multi-stage Dockerfile, Docker Compose, and GitHub Actions CI/CD workflow",
        "Automated Linux/Bash or Terraform provisioning scripts with clear architecture diagram",
        "Live deployed service with health check endpoint and monitoring/log documentation",
      ],
      projectTitle: "Automated CI/CD & Containerized Cloud Deployment Pipeline with Health Monitoring",
      project:
        "Take a web/API service, write a multi-stage Dockerfile, build an automated GitHub Actions CI/CD pipeline (lint, test, build, deploy), and document infrastructure and observability setup.",
      projectReason:
        "DevOps roles require tangible proof of automation, container security, Linux troubleshooting, and CI/CD reliability.",
      projectMilestones: [
        "Create a production multi-stage Dockerfile and local Docker Compose environment",
        "Build a GitHub Actions CI/CD pipeline that runs automated tests on every pull request",
        "Automate deployment to a cloud host or Kubernetes/container runtime with health checks",
        "Add structured logging/metrics and write an incident/runbook README",
      ],
      projectLinks: [
        {
          label: "Docker Official Curriculum & Best Practices",
          url: "https://docs.docker.com/get-started/",
          whyUseful: "Learn multi-stage builds, image optimization, and container networking.",
        },
        {
          label: "GitHub Actions CI/CD Documentation",
          url: "https://docs.github.com/en/actions",
          whyUseful: "Build automated test and deployment workflows directly in your repositories.",
        },
      ],
    };
  }

  // 9. Mechanical Design Engineer
  if (r.includes("mechanical") || r.includes("cad") || r.includes("automotive") || r.includes("thermal")) {
    return {
      roleProfileName: "Mechanical Design Engineer",
      required: [
        "Engineering drawing",
        "3D CAD (SolidWorks/Fusion 360)",
        "Materials & manufacturing",
        "First-principles load calculations",
      ],
      preferred: ["GD&T", "FEA simulation (ANSYS)", "Communication"],
      responsibilities: [
        "Design constrained 3D CAD parts and assemblies and generate 2D manufacturing drawings",
        "Perform first-principles force, stress, and torque calculations to size components safely",
        "Select engineering materials and manufacturing processes (DFM) and validate designs via FEA",
      ],
      expectedEvidence: [
        "Parametric 3D CAD assembly and 2D Engineering drawing pack with BOM and section views",
        "Hand-calculation sheet (free-body diagram, bending/shear stress, Factor of Safety)",
        "FEA simulation report (ANSYS/SolidWorks Simulation) and GD&T tolerance justification",
      ],
      projectTitle: "Constrained 3D CAD Mechanism with First-Principles Load Calculations, FEA & GD&T Drawings",
      project:
        "Design a functional mechanical assembly (e.g., suspension upright, robotic gripper, or gearbox housing) with hand load calculations, parametric 3D CAD, FEA stress verification, and GD&T production drawings.",
      projectReason:
        "Core mechanical design interviews evaluate whether you can justify part thickness, material choice, and tolerances using physics and manufacturing constraints.",
      projectMilestones: [
        "Define functional loads and complete first-principles hand calculations for stress and Factor of Safety",
        "Model a fully constrained parametric 3D CAD assembly with material properties and DFM checks",
        "Run static structural FEA simulation and compare simulated stress against hand calculations",
        "Export 2D Engineering drawings with GD&T callouts and compile a PDF design portfolio case study",
      ],
      projectLinks: [
        {
          label: "GD&T Basics — ASME Y14.5 Engineering Guide",
          url: "https://www.gdandtbasics.com/gdt-symbols/",
          whyUseful: "Practical reference for geometric tolerances, datums, and manufacturing fits.",
        },
        {
          label: "ANSYS Free Engineering Simulation Courses",
          url: "https://courses.ansys.com/",
          whyUseful: "Learn mesh convergence, boundary conditions, and structural/thermal FEA validation.",
        },
      ],
    };
  }

  // 10. Civil / Structural Engineer
  if (r.includes("civil") || r.includes("structural") || r.includes("construction") || r.includes("bim")) {
    return {
      roleProfileName: "Civil / Structural Engineer",
      required: [
        "Engineering mechanics",
        "CAD or BIM (AutoCAD/Revit)",
        "Quantity estimating (BOQ)",
        "Safety & building codes",
      ],
      preferred: ["Structural analysis", "Surveying", "Communication"],
      responsibilities: [
        "Calculate structural loads, shear forces, and bending moments using Engineering mechanics",
        "Draft detailed civil plans, reinforcement layouts, and 3D models in CAD or BIM (AutoCAD/Revit)",
        "Prepare accurate Quantity estimating (BOQ) sheets and verify designs against Safety & building codes",
      ],
      expectedEvidence: [
        "AutoCAD structural plan/section drawings or Revit 3D BIM model PDF/pack",
        "Structural calculation report verifying beam/column/slab loads against IS 456 / IS 800 / building codes",
        "Complete Excel Bill of Quantities (BOQ) and material take-off sheet linked to the drawings",
      ],
      projectTitle: "Code-Compliant Structural Design & BIM Package with Load Calculations & BOQ Estimate",
      project:
        "Complete a structural design and drafting package for a G+2 building bay or truss bridge, including code-compliant load calculations, AutoCAD/Revit drawings, and a complete Bill of Quantities (BOQ).",
      projectReason:
        "Civil and structural employers look for candidates who connect CAD/BIM drawings with code-verified structural calculations and accurate quantity estimates.",
      projectMilestones: [
        "Define dead, live, and wind load assumptions and compute member forces using Engineering mechanics",
        "Draft scaled structural floor plans, elevations, and reinforcement details in AutoCAD or Revit BIM",
        "Verify member dimensions and safety factors against IS 456 / IS 800 building code clauses",
        "Prepare a detailed Quantity estimating (BOQ) spreadsheet and publish a technical case study report",
      ],
      projectLinks: [
        {
          label: "NPTEL Civil & Structural Design Courses",
          url: "https://nptel.ac.in/courses/105",
          whyUseful: "Comprehensive lectures on RCC design, structural analysis, and construction estimation.",
        },
        {
          label: "Autodesk Revit & AutoCAD Documentation",
          url: "https://help.autodesk.com/view/RVT/2024/ENU/",
          whyUseful: "Official guide for BIM structural modeling, schedules, and sheet drafting.",
        },
      ],
    };
  }

  // 11. Electrical / Power Systems Engineer
  if (r.includes("electrical") || r.includes("power") || r.includes("eee") || r.includes("control")) {
    return {
      roleProfileName: "Electrical / Power Systems Engineer",
      required: [
        "Circuit analysis",
        "Power electronics & drives",
        "MATLAB/Simulink",
        "Control systems",
      ],
      preferred: ["Microcontrollers", "PCB or simulation tools", "Safety & standards"],
      responsibilities: [
        "Analyze and simulate electrical circuits, converters, and motor drives in MATLAB/Simulink",
        "Design closed-loop Control systems and verify transient stability and efficiency",
        "Select protection components, sensors, and schematic layouts compliant with electrical safety standards",
      ],
      expectedEvidence: [
        "MATLAB/Simulink or LTspice simulation repository with waveform and efficiency plots",
        "Closed-loop controller design calculations (PID / state-space) and bode/step-response verification",
        "Hardware prototype or schematic layout with bill of materials and test report",
      ],
      projectTitle: "Closed-Loop Power Converter or Motor Drive Simulation & Control Design in MATLAB/Simulink",
      project:
        "Model, design, and verify a closed-loop DC-DC buck/boost converter or BLDC motor drive in MATLAB/Simulink or LTspice, documenting component sizing, PID tuning, efficiency, and protection circuits.",
      projectReason:
        "Core electrical interviews focus on circuit transients, converter topologies, control loop stability, and simulation verification.",
      projectMilestones: [
        "Calculate inductor, capacitor, and switch ratings from voltage/current ripple specifications",
        "Build an open-loop and closed-loop PID model in MATLAB/Simulink or LTspice",
        "Analyze load-step transient response, efficiency, and thermal/protection margins",
        "Publish simulation files, schematics, and a structured engineering design report",
      ],
      projectLinks: [
        {
          label: "MathWorks Simulink & Power Systems Tutorials",
          url: "https://www.mathworks.com/support/learn-with-matlab-tutorials.html",
          whyUseful: "Official tutorials for modeling control systems, power electronics, and drives.",
        },
        {
          label: "NPTEL Electrical Engineering Archive",
          url: "https://nptel.ac.in/courses/108",
          whyUseful: "Core references for power electronics, machines, and control engineering.",
        },
      ],
    };
  }

  // 12. Default Full-Stack / Software Developer Profile
  return {
    roleProfileName: "Full-Stack / Software Developer",
    required: [
      "Data structures",
      "JavaScript/TypeScript",
      "React",
      "HTTP/REST",
      "SQL",
      "Git",
    ],
    preferred: ["Authentication", "Testing", "Deployment"],
    responsibilities: [
      "Build end-to-end web features spanning React frontend components, HTTP/REST APIs, and SQL databases",
      "Apply Data structures and clean modular code to solve user and system problems efficiently",
      "Collaborate using Git branches, write automated tests, and maintain deployed applications",
    ],
    expectedEvidence: [
      "Public GitHub repository of a full-stack application (React + REST API + SQL database)",
      "Live deployed demo URL with working Authentication and persistent data storage",
      "Automated test suite and architectural README explaining system design and trade-offs",
    ],
    projectTitle: "End-to-End Full-Stack Web Application with React, REST API, SQL, Auth & Live Deployment",
    project:
      "Build, test, and deploy a full-stack application that solves a real workflow problem using React/TypeScript on the frontend, a REST API with Authentication on the backend, and a relational SQL database.",
    projectReason:
      "Software engineering recruiters look for candidates who can connect a clean UI to a persistent, authenticated backend with tests and a live demo link.",
    projectMilestones: [
      "Design the relational SQL schema and build typed HTTP/REST API endpoints",
      "Build a responsive React + TypeScript frontend connected to the API with form validation",
      "Add user Authentication, automated tests, and a clean multi-commit Git history",
      "Deploy the full-stack app to a public URL and write an engineering architecture README",
    ],
    projectLinks: [
      {
        label: "MDN Web Docs — HTTP & Web Architecture",
        url: "https://developer.mozilla.org/en-US/docs/Web",
        whyUseful: "Comprehensive reference for web standards, DOM, HTTP, and security.",
      },
      {
        label: "React Official Documentation",
        url: "https://react.dev/learn",
        whyUseful: "Modern patterns for building interactive component trees and managing state.",
      },
      {
        label: "Pro Git Book",
        url: "https://git-scm.com/book/en/v2",
        whyUseful: "Master version control, branching strategies, and collaborative workflows.",
      },
    ],
  };
}

/**
 * Builds the complete explicit Role Profile Track adapted to:
 * branch + goal (Internship, Placement, Higher studies) + target role + current year + company
 * WITHOUT inventing company-specific requirements when no verifiable JD text is provided.
 */
export function getBaselineTrack(
  role: string,
  branch: string,
  goal: StudentForm["goal"] = "Internship",
  year: StudentForm["year"] = "2nd Year",
  company: string = "",
  jobSourceUrl: string = ""
): Track {
  const raw = getRawRoleProfile(role, branch);

  const required = [...raw.required];
  const preferred = [...raw.preferred];
  const responsibilities = [...raw.responsibilities];
  const expectedEvidence = [...raw.expectedEvidence];

  // Adapt by Goal (Internship vs Placement vs Higher studies)
  if (goal === "Higher studies") {
    if (!preferred.includes("Research methodology & paper reproduction")) {
      preferred.push("Research methodology & paper reproduction");
    }
    responsibilities.push(
      `Conduct literature review, reproduce benchmark experiments, and author technical reports for ${raw.roleProfileName} research`
    );
    expectedEvidence.push(
      "Reproducible research code repository or technical report/preprint suitable for MS/MTech/PhD statement of purpose"
    );
  } else if (goal === "Placement") {
    expectedEvidence.push(
      `Production-ready benchmarking, edge-case testing, and system trade-off defense expected for full-time ${raw.roleProfileName} placement interviews`
    );
  }

  // Adapt by Branch-to-Role relationship
  const isSoftwareOrDataRole =
    /backend|frontend|full-stack|software|ml|data|devops|cyber/i.test(raw.roleProfileName);
  const isCoreNonCsBranch = /mechanical|civil|chemical|metallurg|aerospace|production|biotech/i.test(
    branch
  );

  let adaptationSummary = `Adapted for ${branch} · ${year} · ${goal} targeting ${role}.`;
  if (isSoftwareOrDataRole && isCoreNonCsBranch) {
    adaptationSummary = `Cross-disciplinary path (${branch} → ${role} for ${goal}): Prioritizes verifiable code/data repositories to bridge your core engineering background into ${raw.roleProfileName}.`;
  }

  const skillDetails: SkillDetail[] = [
    ...required.map((s) =>
      getSkillDetail(
        s,
        "Required",
        role,
        `Explicit Role Profile (${raw.roleProfileName} · ${goal})`
      )
    ),
    ...preferred.map((s) =>
      getSkillDetail(
        s,
        "Preferred",
        role,
        `Explicit Role Profile (${raw.roleProfileName} · ${goal})`
      )
    ),
  ];

  const tasks: TrackTask[] = [
    ...required.slice(0, 3).map((s) => ({
      task: `Build and document verifiable working proof for ${s}`,
      reason: `Core required skill in the ${raw.roleProfileName} profile for ${goal} (${year}).`,
      targetSkill: s,
    })),
    ...preferred.slice(0, 2).map((s) => ({
      task: `Integrate ${s} into your primary ${role} proof project`,
      reason: `Preferred differentiator that strengthens your ${goal.toLowerCase()} portfolio.`,
      targetSkill: s,
    })),
  ];

  // Strict non-hallucination company verification policy
  const hasCompanySelected = Boolean(company && company.trim().length > 0);
  const hasUrlOnly = Boolean(jobSourceUrl && jobSourceUrl.trim().length > 0);

  const verificationStatusLabel = hasCompanySelected
    ? "Company-specific requirements not verified"
    : `Verified Explicit Role Profile (${raw.roleProfileName})`;

  const sourceSummary = hasCompanySelected
    ? `Target Company: ${company}${hasUrlOnly ? ` (URL: ${jobSourceUrl})` : ""}. Company-specific requirements not verified because no verifiable job description text was pasted. Using only the explicit ${raw.roleProfileName} role profile.`
    : `Derived from the explicit ${raw.roleProfileName} profile combined with ${branch}, ${year}, and ${goal}.`;

  const missingInformationNotes: string[] = [];
  if (hasCompanySelected) {
    missingInformationNotes.push(
      `Company-specific requirements not verified: VisionPath never invents requirements from the company name "${company}" alone.`
    );
    if (hasUrlOnly) {
      missingInformationNotes.push(
        `Job URL supplied (${jobSourceUrl}), but external careers pages cannot be verified without pasted job description text.`
      );
    } else {
      missingInformationNotes.push(
        `No job description text was pasted for ${company}. Paste the official job posting text to verify company-specific skills.`
      );
    }
  } else {
    missingInformationNotes.push(
      `No live job description pasted yet — currently using the explicit ${raw.roleProfileName} benchmark profile.`
    );
  }

  return {
    roleProfileName: raw.roleProfileName,
    required,
    preferred,
    responsibilities,
    expectedEvidence,
    skillDetails,
    projectTitle: raw.projectTitle,
    project: raw.project,
    projectReason: raw.projectReason,
    projectMilestones: raw.projectMilestones,
    projectLinks: raw.projectLinks,
    tasks,
    sourceType: "role-profile",
    isCompanyVerified: false,
    verificationStatusLabel,
    sourceSummary,
    missingInformationNotes,
    adaptationSummary,
  };
}

/**
 * Strictly extracts skills ONLY from the pasted Job Description text.
 * If the pasted text is missing or ambiguous, it flags "Company-specific requirements not verified"
 * and uses only the explicit role profile.
 */
export function extractJobDescriptionDeterministically(
  jdText: string,
  role: string,
  branch: string,
  goal: StudentForm["goal"] = "Internship",
  year: StudentForm["year"] = "2nd Year",
  company: string = "",
  jobSourceUrl: string = ""
): Track {
  const baseline = getBaselineTrack(role, branch, goal, year, company, jobSourceUrl);
  const trimmed = (jdText || "").trim();

  if (!trimmed || trimmed.length < 25) {
    return {
      ...baseline,
      isCompanyVerified: false,
      verificationStatusLabel: "Company-specific requirements not verified",
      missingInformationNotes: [
        "Company-specific requirements not verified: Pasted job description is empty or too short.",
        `Using only the explicit ${baseline.roleProfileName} profile.`,
      ],
    };
  }

  const lines = trimmed
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const skillPatterns: Array<{
    label: string;
    patterns: RegExp[];
    defaultTier: "Required" | "Preferred";
  }> = [
    { label: "Data structures", patterns: [/data structures/i, /\balgorithms\b/i, /\bdsa\b/i], defaultTier: "Required" },
    { label: "HTTP/REST", patterns: [/\bhttp\b/i, /\brest\b/i, /rest\s*apis?/i, /\bapis?\b/i, /\bfastapi\b/i], defaultTier: "Required" },
    { label: "One backend language", patterns: [/backend language/i, /\bjava\b/i, /\bgolang\b/i, /\bnode\.?js\b/i, /\bc#\b/i, /spring boot/i], defaultTier: "Required" },
    { label: "SQL", patterns: [/\bsql\b/i, /\bpostgres/i, /\bmysql\b/i, /relational database/i, /window functions/i], defaultTier: "Required" },
    { label: "Authentication", patterns: [/authentication/i, /\bauth\b/i, /\bjwt\b/i, /\boauth/i, /\brbac\b/i], defaultTier: "Required" },
    { label: "Git", patterns: [/\bgit\b/i, /github/i, /version control/i, /pull requests?/i], defaultTier: "Required" },
    { label: "Testing", patterns: [/\btesting\b/i, /unit tests?/i, /integration tests?/i, /\bpytest\b/i, /\bjest\b/i], defaultTier: "Preferred" },
    { label: "Deployment", patterns: [/deployment/i, /\bdeploy\b/i, /\bdocker\b/i, /container/i, /cloud hosting/i], defaultTier: "Preferred" },
    { label: "Python", patterns: [/\bpython\b/i], defaultTier: "Required" },
    { label: "Statistics", patterns: [/\bstatistics\b/i, /statistical/i, /probability/i, /hypothesis/i], defaultTier: "Required" },
    { label: "Linear algebra basics", patterns: [/linear algebra/i, /matrix/i, /vectors?/i, /eigen/i], defaultTier: "Required" },
    { label: "NumPy/pandas", patterns: [/numpy/i, /\bpandas\b/i, /dataframe/i], defaultTier: "Required" },
    { label: "Scikit-learn or PyTorch", patterns: [/scikit[- ]learn/i, /\bpytorch\b/i, /tensorflow/i, /machine learning/i, /deep learning/i], defaultTier: "Required" },
    { label: "Model evaluation", patterns: [/model evaluation/i, /precision/i, /recall/i, /roc-auc/i, /cross[- ]validation/i, /error analysis/i], defaultTier: "Required" },
    { label: "Data pipelines", patterns: [/data pipelines?/i, /\betl\b/i, /data cleaning/i, /feature engineering/i], defaultTier: "Preferred" },
    { label: "Experiment tracking", patterns: [/experiment tracking/i, /\bmlflow\b/i, /weights\s*&\s*biases/i, /ablation/i], defaultTier: "Preferred" },
    { label: "Excel/Sheets", patterns: [/\bexcel\b/i, /google sheets/i, /spreadsheets?/i, /pivot tables?/i], defaultTier: "Required" },
    { label: "Python/pandas", patterns: [/python\/pandas/i, /\bpandas\b/i], defaultTier: "Required" },
    { label: "Dashboards", patterns: [/dashboards?/i, /visualization/i, /power\s*bi/i, /tableau/i, /\bkpi/i], defaultTier: "Required" },
    { label: "Communication", patterns: [/communication/i, /stakeholder/i, /present/i, /business insights/i], defaultTier: "Required" },
    { label: "HTML/CSS", patterns: [/\bhtml\b/i, /\bcss\b/i, /flexbox/i, /tailwind/i], defaultTier: "Required" },
    { label: "JavaScript/TypeScript", patterns: [/javascript/i, /typescript/i, /\bes6\b/i], defaultTier: "Required" },
    { label: "React", patterns: [/\breact\b/i, /next\.?js/i, /frontend component/i], defaultTier: "Required" },
    { label: "Accessibility", patterns: [/accessibility/i, /\bwcag\b/i, /\baria\b/i, /keyboard navigation/i], defaultTier: "Required" },
    { label: "C/C++", patterns: [/\bc\/c\+\+\b/i, /\bc\+\+\b/i, /embedded c\b/i, /firmware/i], defaultTier: "Required" },
    { label: "Microcontrollers", patterns: [/microcontrollers?/i, /\bstm32\b/i, /arm cortex/i, /\besp32\b/i, /\bmcu\b/i], defaultTier: "Required" },
    { label: "UART/I2C/SPI", patterns: [/\buart\b/i, /\bi2c\b/i, /\bspi\b/i, /\bcan\b/i, /serial protocols?/i], defaultTier: "Required" },
    { label: "Debugging", patterns: [/debugging/i, /\bgdb\b/i, /oscilloscope/i, /logic analyzer/i, /\bjtag\b/i], defaultTier: "Required" },
    { label: "RTOS basics", patterns: [/\brtos\b/i, /freertos/i, /real[- ]time operating/i], defaultTier: "Preferred" },
    { label: "Engineering drawing", patterns: [/engineering drawing/i, /2d drawing/i, /orthographic/i, /drafting/i], defaultTier: "Required" },
    { label: "3D CAD (SolidWorks/Fusion 360)", patterns: [/\bcad\b/i, /solidworks/i, /fusion 360/i, /catia/i, /creo/i], defaultTier: "Required" },
    { label: "Materials & manufacturing", patterns: [/materials?/i, /manufacturing/i, /\bdfm\b/i, /machining/i], defaultTier: "Required" },
    { label: "First-principles load calculations", patterns: [/load calculations?/i, /first[- ]principles/i, /stress/i, /free[- ]body/i], defaultTier: "Required" },
    { label: "GD&T", patterns: [/gd&t/i, /toleranc/i, /asme/i], defaultTier: "Preferred" },
    { label: "FEA simulation (ANSYS)", patterns: [/\bfea\b/i, /\bansys\b/i, /finite element/i, /simulation/i], defaultTier: "Preferred" },
    { label: "Engineering mechanics", patterns: [/engineering mechanics/i, /strength of materials/i, /equilibrium/i], defaultTier: "Required" },
    { label: "CAD or BIM (AutoCAD/Revit)", patterns: [/autocad/i, /\brevit\b/i, /\bbim\b/i], defaultTier: "Required" },
    { label: "Quantity estimating (BOQ)", patterns: [/estimating/i, /\bboq\b/i, /bill of quantities/i, /quantity take/i], defaultTier: "Required" },
    { label: "Safety & building codes", patterns: [/safety/i, /building codes?/i, /\bis\s*456\b/i, /\bis\s*800\b/i], defaultTier: "Required" },
    { label: "Structural analysis", patterns: [/structural analysis/i, /staad/i, /etabs/i], defaultTier: "Preferred" },
    { label: "Verilog / SystemVerilog", patterns: [/verilog/i, /systemverilog/i, /\brtl\b/i], defaultTier: "Required" },
    { label: "Linux & Bash", patterns: [/\blinux\b/i, /\bbash\b/i, /shell script/i], defaultTier: "Required" },
    { label: "CI/CD pipelines", patterns: [/ci\/cd/i, /github actions/i, /jenkins/i], defaultTier: "Required" },
  ];

  const requiredSet = new Set<string>();
  const preferredSet = new Set<string>();
  const responsibilities: string[] = [];
  const snippetMap: Record<string, string> = {};

  let currentSection: "required" | "preferred" | "responsibility" | "neutral" = "neutral";
  let sawExplicitPreferredSection = false;
  let sawExplicitResponsibilities = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[-•*]\s*/, "").trim();
    const lower = line.toLowerCase();

    if (/^(required|must have|minimum qualifications|requirements)/i.test(lower)) {
      currentSection = "required";
      continue;
    }
    if (/^(preferred|nice to have|bonus|desired|good to have)/i.test(lower)) {
      currentSection = "preferred";
      sawExplicitPreferredSection = true;
      continue;
    }
    if (/^(responsibilities|what you will do|role overview|duties)/i.test(lower)) {
      currentSection = "responsibility";
      sawExplicitResponsibilities = true;
      continue;
    }

    if (
      currentSection === "responsibility" ||
      /^(design|build|develop|analyze|train|prepare|collaborate|assist|create|write|test|debug|monitor|implement|model|interface|ensure)\b/i.test(
        line
      )
    ) {
      if (responsibilities.length < 6 && line.length > 14 && line.length < 160) {
        if (!responsibilities.includes(line)) {
          responsibilities.push(line);
          sawExplicitResponsibilities = true;
        }
      }
    }

    for (const item of skillPatterns) {
      if (item.patterns.some((p) => p.test(line))) {
        const isPref =
          currentSection === "preferred" ||
          /\b(preferred|bonus|nice to have|plus|familiarity|exposure)\b/i.test(lower);
        const isReq =
          currentSection === "required" ||
          /\b(required|must|strong|proficient|solid|hands-on|demonstrated)\b/i.test(lower);

        const tier = isPref ? "Preferred" : isReq ? "Required" : item.defaultTier;
        if (tier === "Required") {
          requiredSet.add(item.label);
          preferredSet.delete(item.label);
        } else if (!requiredSet.has(item.label)) {
          preferredSet.add(item.label);
          sawExplicitPreferredSection = true;
        }

        if (!snippetMap[item.label]) {
          snippetMap[item.label] = line.length > 120 ? line.slice(0, 117) + "..." : line;
        }
      }
    }
  }

  const totalExtracted = requiredSet.size + preferredSet.size;

  // If the pasted JD was ambiguous or contained < 2 recognizable technical skills, DO NOT invent requirements;
  // flag "Company-specific requirements not verified" and fall back to the selected explicit role profile!
  if (totalExtracted < 2) {
    return {
      ...baseline,
      isCompanyVerified: false,
      verificationStatusLabel: "Company-specific requirements not verified",
      sourceSummary: `Supplied text did not contain enough verifiable technical requirements (${totalExtracted} skills detected). Using only the explicit ${baseline.roleProfileName} role profile.`,
      missingInformationNotes: [
        "Company-specific requirements not verified: The supplied job description text was ambiguous or lacked explicit technical skill requirements.",
        `Using the explicit ${baseline.roleProfileName} profile (${baseline.required.length} required, ${baseline.preferred.length} preferred skills) instead of guessing.`,
      ],
    };
  }

  // Strictly prioritize ONLY skills extracted from the supplied JD text!
  const finalRequired = Array.from(requiredSet);
  const finalPreferred = Array.from(preferredSet);

  // If all extracted skills landed in Preferred, promote top ones to Required so required is non-empty
  if (finalRequired.length === 0 && finalPreferred.length > 0) {
    finalRequired.push(...finalPreferred.splice(0, Math.min(3, finalPreferred.length)));
  }

  const missingNotes: string[] = [];
  if (!sawExplicitPreferredSection || finalPreferred.length === 0) {
    missingNotes.push(
      "Missing in supplied JD: Preferred/bonus skills were not explicitly separated in the pasted text."
    );
  }
  if (!sawExplicitResponsibilities || responsibilities.length === 0) {
    missingNotes.push(
      "Missing in supplied JD: Day-to-day responsibilities were not explicitly listed in the pasted text (showing role baseline responsibilities labeled clearly)."
    );
  }
  if (!/\b(cgpa|gpa|year|semester|degree|b\.?tech|b\.?e)\b/i.test(trimmed)) {
    missingNotes.push(
      "Missing in supplied JD: Specific graduation year or CGPA cutoff was not stated in the pasted text."
    );
  }
  if (!/\b(github|portfolio|demo|certificate)\b/i.test(trimmed)) {
    missingNotes.push(
      "Missing in supplied JD: Explicit portfolio/proof format was not specified in the text — mapped expected evidence from verified skill requirements."
    );
  }

  const skillDetails: SkillDetail[] = [
    ...finalRequired.map((s) =>
      getSkillDetail(s, "Required", role, `Extracted from JD: "${snippetMap[s] || s}"`)
    ),
    ...finalPreferred.map((s) =>
      getSkillDetail(s, "Preferred", role, `Extracted from JD: "${snippetMap[s] || s}"`)
    ),
  ];

  const expectedEvidence = skillDetails.map((sd) => `${sd.skill}: ${sd.expectedEvidence}`);

  const extractedTasks: TrackTask[] = [
    ...finalRequired.slice(0, 3).map((s) => ({
      task: `Build and verify project evidence for ${s}`,
      reason: `Explicitly extracted as a Required skill from your pasted ${company ? `${company} ` : ""}job description.`,
      targetSkill: s,
    })),
    ...finalPreferred.slice(0, 2).map((s) => ({
      task: `Add ${s} as a differentiator in your portfolio proof`,
      reason: `Extracted as a Preferred skill from your pasted job description.`,
      targetSkill: s,
    })),
  ];

  return {
    ...baseline,
    required: finalRequired,
    preferred: finalPreferred,
    responsibilities:
      responsibilities.length > 0 ? responsibilities : baseline.responsibilities,
    expectedEvidence,
    skillDetails,
    projectTitle: `JD-Verified Proof Project for ${role}${company ? ` (${company})` : ""}`,
    project: `Build and document a verifiable project demonstrating the exact skills extracted from your pasted job description: ${finalRequired.join(", ")}${finalPreferred.length > 0 ? ` (plus ${finalPreferred.join(", ")})` : ""}.`,
    projectReason: `Prioritizes only the ${finalRequired.length} required and ${finalPreferred.length} preferred skills verified directly from your supplied job description text.`,
    tasks: extractedTasks.length > 0 ? extractedTasks : baseline.tasks,
    sourceType: "jd-deterministic",
    isCompanyVerified: true,
    verificationStatusLabel: `Verified from Supplied Job Description${company ? ` (${company})` : ""}`,
    sourceSummary: `Extracted strictly from your supplied job description text (${finalRequired.length} required skills, ${finalPreferred.length} preferred skills${jobSourceUrl ? ` · Source URL: ${jobSourceUrl}` : ""}).`,
    missingInformationNotes: missingNotes,
  };
}

const SIMPLE_LEVEL_SCORES: Record<SimpleSkillLevel, number> = {
  "Need to learn": 0,
  "Learning it": 50,
  "Know it": 95,
};

export function computeDeterministicGapAnalysis(
  track: Track,
  levels: Record<string, SkillLevel>,
  evidence: PortfolioEvidence,
  profile: StudentForm
): DeterministicGapAnalysis {
  const hasAnyPortfolioLink = Boolean(
    evidence.githubUrl.trim() ||
      evidence.demoUrl.trim() ||
      evidence.resumeUrl.trim() ||
      evidence.certificateUrl.trim()
  );

  const evaluateSkill = (skill: string, isRequired: boolean): SkillGapItem => {
    const currentLevel: SimpleSkillLevel = normalizeSkillLevel(levels[skill]);
    const baseScore = SIMPLE_LEVEL_SCORES[currentLevel] ?? 0;
    const specificUrl = (evidence.skillEvidenceMap[skill] || "").trim();
    const hasEvidence =
      Boolean(specificUrl) || (hasAnyPortfolioLink && currentLevel === "Know it");

    const effectiveScore =
      currentLevel === "Know it" && hasEvidence ? 100 : baseScore;

    const targetScore = isRequired ? 100 : 80;
    const targetLevelLabel = isRequired ? "Know it (100%)" : "Working level (80%)";
    const gapPoints = Math.max(0, targetScore - effectiveScore);

    let gapBand: SkillGapItem["gapBand"] = "Low gap";
    let gapSeverity: SkillGapItem["gapSeverity"] = "Strong proof";

    if (currentLevel === "Need to learn") {
      gapBand = isRequired ? "High gap" : "Medium gap";
      gapSeverity = isRequired ? "High gap" : "Medium gap";
    } else if (currentLevel === "Learning it") {
      gapBand = "Medium gap";
      gapSeverity = "Medium gap";
    } else {
      gapBand = "Low gap";
      gapSeverity = hasEvidence ? "Strong proof" : "Review / Add proof";
    }

    const detail =
      track.skillDetails.find((d) => d.skill.toLowerCase() === skill.toLowerCase()) ||
      getSkillDetail(skill, isRequired ? "Required" : "Preferred", profile.role);

    let whatIsMissing = "";
    let nextAction = "";
    if (currentLevel === "Need to learn") {
      whatIsMissing = `Not started yet (${gapPoints}% below target). Missing core concepts and hands-on practice in ${skill}.`;
      nextAction = `Learn core ${skill} fundamentals and build: ${detail.expectedEvidence}`;
    } else if (currentLevel === "Learning it") {
      whatIsMissing = `In progress (${gapPoints}% gap to target). Needs practical implementation beyond theory/tutorials.`;
      nextAction = `Apply ${skill} inside your role project to produce: ${detail.expectedEvidence}`;
    } else if (!hasEvidence) {
      whatIsMissing = `Skill known — optional next step is linking verifiable proof (${detail.expectedEvidence}).`;
      nextAction = `Link your GitHub repo, report, or demo showing ${skill} in action.`;
    } else {
      whatIsMissing = `Meets target level with linked proof.`;
      nextAction = `Ready — review key design trade-offs for ${skill} before technical discussions.`;
    }

    return {
      skill,
      isRequired,
      currentLevel,
      score: effectiveScore,
      targetScore,
      targetLevelLabel,
      gapPoints,
      gapBand,
      gapSeverity,
      hasEvidence,
      evidenceUrl: specificUrl || evidence.githubUrl || evidence.demoUrl || "",
      whatIsMissing,
      whyItMatters: detail.whyItMatters,
      expectedEvidence: detail.expectedEvidence,
      sourceSnippet: detail.sourceSnippet,
      nextAction,
    };
  };

  const reqItems = track.required.map((s) => evaluateSkill(s, true));
  const prefItems = track.preferred.map((s) => evaluateSkill(s, false));

  // Sort skills strictly by priority:
  // 1) Required skills first, sorted by largest gap (gapPoints descending)
  // 2) Preferred skills next, sorted by largest gap (gapPoints descending)
  const sortedReqItems = [...reqItems].sort((a, b) => b.gapPoints - a.gapPoints);
  const sortedPrefItems = [...prefItems].sort((a, b) => b.gapPoints - a.gapPoints);
  const allItems = [...sortedReqItems, ...sortedPrefItems];

  const avg = (items: SkillGapItem[]) =>
    items.length === 0
      ? 0
      : Math.round(items.reduce((acc, x) => acc + x.score, 0) / items.length);

  const requiredReadiness = avg(reqItems);
  const preferredReadiness = prefItems.length > 0 ? avg(prefItems) : requiredReadiness;

  const readiness =
    allItems.length === 0
      ? 0
      : prefItems.length > 0
        ? Math.round(requiredReadiness * 0.75 + preferredReadiness * 0.25)
        : requiredReadiness;

  const readyCount = allItems.filter((x) => x.currentLevel === "Know it").length;
  const requiredReadyCount = reqItems.filter((x) => x.currentLevel === "Know it").length;
  const requiredTotalCount = reqItems.length;

  const verifiedProofCount = allItems.filter((x) => x.hasEvidence).length;
  const highGapCount = allItems.filter((x) => x.gapBand === "High gap").length;
  const mediumGapCount = allItems.filter((x) => x.gapBand === "Medium gap").length;
  const lowGapCount = allItems.filter((x) => x.gapBand === "Low gap").length;

  let readinessSignal: DeterministicGapAnalysis["readinessSignal"];
  if (readiness >= 75 && highGapCount === 0) {
    readinessSignal = {
      label: "Strong Skill Coverage",
      summary: `You know ${requiredReadyCount} of ${requiredTotalCount} core required skills. Focus on publishing your project proof and polishing medium gaps.`,
      tone: "emerald",
    };
  } else if (readiness >= 45) {
    readinessSignal = {
      label: "Building Momentum",
      summary: `You know ${requiredReadyCount} of ${requiredTotalCount} core required skills. Close your top ${Math.min(3, highGapCount + mediumGapCount)} skill gaps below over the next 30 days.`,
      tone: "amber",
    };
  } else {
    readinessSignal = {
      label: "Starting Foundation",
      summary: `You currently know ${requiredReadyCount} of ${requiredTotalCount} core required skills. Start with the top 3 priority skills and guided 30-day plan below.`,
      tone: "rose",
    };
  }

  return {
    readiness,
    requiredReadiness,
    preferredReadiness,
    readyCount,
    requiredReadyCount,
    requiredTotalCount,
    totalCount: allItems.length,
    verifiedProofCount,
    highGapCount,
    mediumGapCount,
    lowGapCount,
    readinessSignal,
    skillGaps: allItems,
    formulaExplanation:
      "Skill Coverage Score: 75% Required Skills + 25% Preferred Skills (Need to learn = 0%, Learning it = 50%, Know it = 95%–100%). Measures your current skill & project coverage against role requirements — not a hiring prediction.",
  };
}

export function buildDeterministicGuidance(
  profile: StudentForm,
  track: Track,
  gapAnalysis: DeterministicGapAnalysis
): PersonalizedGuidance {
  const effectiveCompany = getEffectiveCompany(profile);
  const priorityGaps = gapAnalysis.skillGaps.filter((g) => g.gapBand !== "Low gap");
  const top3Gaps = (priorityGaps.length > 0 ? priorityGaps : gapAnalysis.skillGaps).slice(0, 3);

  const g1 = top3Gaps[0]?.skill || track.required[0] || "Core Skill 1";
  const g2 = top3Gaps[1]?.skill || track.required[1] || track.required[0] || "Core Skill 2";
  const g3 = top3Gaps[2]?.skill || track.preferred[0] || track.required[0] || "Core Skill 3";

  const g1Evidence = top3Gaps[0]?.expectedEvidence || "Working code repository or technical report";
  const g2Evidence = top3Gaps[1]?.expectedEvidence || "Tested module integrated into your project";
  const g3Evidence = top3Gaps[2]?.expectedEvidence || "Documentation and benchmark summary";

  const companyContext = effectiveCompany
    ? track.isCompanyVerified
      ? ` for ${effectiveCompany} (verified from your pasted job description)`
      : ` targeting ${effectiveCompany} (using the ${track.roleProfileName} profile; company-specific requirements not verified)`
    : ` for ${profile.role}`;

  const executiveSummary = `For your ${profile.goal.toLowerCase()} goal${companyContext}, your current role skill coverage is ${gapAnalysis.readiness}% (${gapAnalysis.requiredReadyCount}/${gapAnalysis.requiredTotalCount} core required skills marked "Know it"). Focus next on ${top3Gaps.map((g) => g.skill).join(", ")} and complete the practical project below.`;

  const yearStageNames: Record<StudentForm["year"], string> = {
    "1st Year": "Year 1 (Foundations & Exploration)",
    "2nd Year": "Year 2 (Skill Building & Meaningful Projects)",
    "3rd Year": "Year 3 (Internships, Portfolio, Resume & Real-World Experience)",
    "4th Year": "Year 4 (Placement Preparation, Interviews & Offer Readiness)",
  };

  const recommendations: GuidanceRecommendation[] = top3Gaps.map((gap, idx) => ({
    title: `${idx === 0 ? "Action 1" : idx === 1 ? "Action 2" : "Action 3"}: Close gap in ${gap.skill}`,
    priority: gap.gapBand,
    targetSkills: [gap.skill],
    action: gap.nextAction,
    reason: gap.whyItMatters,
    proofDeliverable: gap.expectedEvidence,
    yearConnection: `Connects to your ${yearStageNames[profile.year]} milestone for ${profile.role}`,
  }));

  const thirtyDayPhases: RoadmapPhase[] = [
    {
      id: "week-1",
      phaseLabel: "Week 1 · Priority Skill #1",
      title: `Learn & Practice ${g1}`,
      objective: `Close your #1 priority gap in ${g1} for your ${profile.year} BTech plan.`,
      tasks: [
        {
          task: `Complete core concepts and hands-on exercises for ${g1}`,
          reason: `Addresses your highest-priority gap for ${profile.role}.`,
          targetSkill: g1,
        },
        {
          task: `Build a small standalone script, model, or schematic using ${g1}`,
          reason: `Moves ${g1} from "Need to learn" to working practice.`,
          targetSkill: g1,
        },
        {
          task: `Set up repository/project folder for "${track.projectTitle}"`,
          reason: `Creates a clean workspace to publish your work.`,
          targetSkill: g1,
        },
      ],
      expectedOutput: `Working starter module demonstrating ${g1}.`,
      proofToPublish: g1Evidence,
    },
    {
      id: "week-2",
      phaseLabel: "Week 2 · Priority Skill #2",
      title: `Implement ${g2} in Project`,
      objective: `Apply ${g2} and connect it to your primary role project.`,
      tasks: [
        {
          task: `Practice ${g2} workflows and integrate with your Week 1 module`,
          reason: `Closes your second priority skill gap (${g2}).`,
          targetSkill: g2,
        },
        {
          task: `Complete Milestone 1 & 2 of "${track.projectTitle}"`,
          reason: `Builds the core technical engine of your proof project.`,
          targetSkill: g2,
        },
        {
          task: `Handle edge cases, validation, or error checks for ${g2}`,
          reason: `Shows engineering rigor beyond classroom assignments.`,
          targetSkill: g2,
        },
      ],
      expectedOutput: `Core functional build of "${track.projectTitle}".`,
      proofToPublish: g2Evidence,
    },
    {
      id: "week-3",
      phaseLabel: "Week 3 · Integration & Skill #3",
      title: `Add ${g3} & Verification`,
      objective: `Layer in ${g3} and verify your project with tests or benchmarks.`,
      tasks: [
        {
          task: `Integrate ${g3} into "${track.projectTitle}"`,
          reason: `Covers your third priority skill (${g3}).`,
          targetSkill: g3,
        },
        {
          task: `Run verification tests, simulations, or performance checks`,
          reason: `Produces concrete metrics to cite in technical discussions.`,
          targetSkill: g3,
        },
      ],
      expectedOutput: `Verified end-to-end project with test/metric results.`,
      proofToPublish: g3Evidence,
    },
    {
      id: "week-4",
      phaseLabel: "Week 4 · Proof & Resume",
      title: `Publish Proof & Update Skill Check`,
      objective: `Package your project evidence for ${profile.year} ${profile.goal.toLowerCase()} readiness.`,
      tasks: [
        {
          task: `Write a clear README / technical summary with architecture diagram & results`,
          reason: `Makes your project easy to inspect for ${profile.goal.toLowerCase()} shortlisting.`,
          targetSkill: g1,
        },
        {
          task: `Publish public link (GitHub / demo / report) and mark skills as "Know it"`,
          reason: `Converts your learning into verifiable portfolio proof.`,
          targetSkill: g2,
        },
      ],
      expectedOutput: `Published portfolio project + updated 1-page resume bullet.`,
      proofToPublish: `Public GitHub repo / live demo / PDF design report link.`,
    },
  ];

  const flattenedTasks: TrackTask[] = thirtyDayPhases.flatMap((p) => p.tasks);

  const yearIndexMap: Record<StudentForm["year"], number> = {
    "1st Year": 0,
    "2nd Year": 1,
    "3rd Year": 2,
    "4th Year": 3,
  };
  const currentYearIdx = yearIndexMap[profile.year] ?? 1;

  const getStatusForYear = (idx: number): YearStagePlan["statusForStudent"] => {
    if (idx < currentYearIdx) return "Completed Foundation";
    if (idx === currentYearIdx) return "Current Active Year";
    return "Upcoming Milestone";
  };

  const yearPlan: YearStagePlan[] = [
    {
      yearLabel: "Year 1 — Foundations & Exploration",
      stageTitle: `Core Fundamentals in ${profile.branch} & Role Exploration`,
      statusForStudent: getStatusForYear(0),
      focusNote:
        currentYearIdx === 0
          ? `Current Year Focus: Build strong fundamentals in ${track.required.slice(0, 2).join(" & ")} and ship 1 mini-project.`
          : `Foundation stage for ${profile.role}.`,
      objective: `Master core ${profile.branch} fundamentals and ${track.required[0] || "foundational"} basics.`,
      skillsFocus: `${track.required.slice(0, 2).join(", ")} + version control / lab documentation`,
      projectsFocus: `1 foundational mini-project or documented lab implementation in ${track.required[0] || profile.role}`,
      internshipActions: `Explore ${profile.role} job descriptions, join campus technical clubs, and set up GitHub/LinkedIn`,
      placementPrep: `Practice weekly problem-solving and basic engineering fundamentals`,
      measurableOutputs: `2 core skills at "Know it" + 1 published starter repository`,
      evidenceToCreate: `Public GitHub / portfolio workspace with a clean README`,
      priorityActions: [
        `Learn and practice ${track.required[0]} and ${track.required[1] || "core problem solving"}`,
        `Publish 1 documented starter mini-project on GitHub/portfolio`,
      ],
      items: [
        `Learn fundamentals of ${track.required[0]} and ${track.required[1] || "core tools"}`,
        `Set up GitHub / portfolio workspace to save lab and mini-project work`,
        `Build 1 starter mini-project with a short README`,
      ],
      expectedOutput: `1 documented starter project + clean Git/portfolio setup.`,
      proofToPublish: `Public starter repository or lab portfolio folder.`,
    },
    {
      yearLabel: "Year 2 — Skill Building & Meaningful Projects",
      stageTitle: `Core Role Skills & Primary Proof Project for ${profile.role}`,
      statusForStudent: getStatusForYear(1),
      focusNote:
        currentYearIdx === 1
          ? `Current Year Focus: Close priority gaps in ${g1} & ${g2} and build "${track.projectTitle}".`
          : `Skill-building and project depth stage for ${profile.role}.`,
      objective: `Move core required skills (${track.required.slice(0, 4).join(", ")}) to "Know it" through a meaningful project.`,
      skillsFocus: `${track.required.slice(0, 4).join(", ")} (plus ${track.preferred[0] || "testing"})`,
      projectsFocus: `Build "${track.projectTitle}" solving a realistic problem with tests/validation`,
      internshipActions: `Apply for summer research, open-source programs, or early ${profile.role} internships`,
      placementPrep: `Complete core ${track.required[0]} exercises and document project architecture`,
      measurableOutputs: `70%+ required skill coverage + 1 end-to-end role project`,
      evidenceToCreate: `${track.expectedEvidence[0] || "Working GitHub repo + demo/report"}`,
      priorityActions: [
        `Close your top skill gaps in ${g1} and ${g2} with hands-on implementation`,
        `Build and publish "${track.projectTitle}" with working proof`,
      ],
      items: [
        `Practice ${track.required.slice(0, 3).join(", ")} through hands-on builds`,
        `Build "${track.projectTitle}" with real data or hardware constraints`,
        `Add ${track.preferred[0] || "testing"} to stand out from basic coursework`,
      ],
      expectedOutput: `Completed role project covering core ${profile.role} skills.`,
      proofToPublish: `${track.expectedEvidence[0] || "GitHub repo + architecture notes"}.`,
    },
    {
      yearLabel: "Year 3 — Internships, Portfolio, Resume & Real-World Experience",
      stageTitle: `Internship Execution, Verified Portfolio & Resume Readiness`,
      statusForStudent: getStatusForYear(2),
      focusNote:
        currentYearIdx === 2
          ? `Current Year Focus: Close remaining gaps (${g1}, ${g2}), publish project proof, and apply for ${effectiveCompany || profile.role} internships.`
          : `Internship, portfolio, and real-world experience stage.`,
      objective: `Reach 80%+ role skill coverage and convert your project portfolio into internship experience.`,
      skillsFocus: `All required skills (${track.required.join(", ")}) + ${track.preferred[0] || "deployment"}`,
      projectsFocus: `Production-ready "${track.projectTitle}" with benchmarks, error handling, and live demo/report`,
      internshipActions: `Submit proof-backed internship applications to ${effectiveCompany || "target companies"} and track deadlines`,
      placementPrep: `Build a 1-page evidence-backed resume and practice technical project defense`,
      measurableOutputs: `80%+ role skill coverage + 1-page resume with verified links + active internship applications`,
      evidenceToCreate: `Live demo / benchmark report + GitHub repository + 1-page resume`,
      priorityActions: [
        `Finish remaining gap in ${g1} and attach verifiable proof (${g1Evidence})`,
        `Tailor your 1-page resume to ${profile.role} responsibilities and apply for internships`,
      ],
      items: [
        `Close remaining gaps in ${track.required.join(", ")}`,
        `Publish end-to-end proof for "${track.projectTitle}" with test/benchmark metrics`,
        `Tailor resume bullets to verified ${profile.role} responsibilities`,
      ],
      expectedOutput: `Verified portfolio + tailored 1-page resume.`,
      proofToPublish: `Live demo / benchmark report + GitHub repository.`,
    },
    {
      yearLabel: "Year 4 — Placement Preparation, Interviews, Applications & Offer Readiness",
      stageTitle: `Full-Time Placement Execution, Interviews & Offer Conversion`,
      statusForStudent: getStatusForYear(3),
      focusNote:
        currentYearIdx === 3
          ? `Current Year Focus: Rapidly close top gaps (${g1}, ${g2}), practice interviews, and track placement applications.`
          : `Final year placement and offer readiness stage.`,
      objective: `Complete all required & preferred skills, ace technical interviews, and track applications to offer readiness.`,
      skillsFocus: `Full mastery of ${track.required.slice(0, 3).join(", ")} + preferred differentiators (${track.preferred.join(", ") || "system design"})`,
      projectsFocus: `Benchmark capstone / role proof project with trade-off documentation for interview defense`,
      internshipActions: `Convert 3rd-year internship / PPO or complete industry semester capstone`,
      placementPrep: `Mock technical & architecture interviews, timed assessments, and active application tracking`,
      measurableOutputs: `90%+ role skill coverage + interview defense readiness + tracked placement pipeline`,
      evidenceToCreate: `Complete portfolio vault (GitHub + Demo + Resume + Certificates)`,
      priorityActions: [
        `Close final skill gaps (${g1}, ${g2}) in a focused 30-day sprint`,
        `Benchmark "${track.projectTitle}" and practice explaining design trade-offs for interviews`,
      ],
      items: [
        `Complete preferred skills (${track.preferred.join(", ") || "advanced topics"})`,
        `Benchmark capstone/role project performance and failure handling`,
        `Practice explaining project architecture and trade-offs clearly`,
      ],
      expectedOutput: `Production-grade capstone proof & interview-ready portfolio.`,
      proofToPublish: `Complete portfolio link + technical architecture summary.`,
    },
  ];

  return {
    executiveSummary,
    recommendations,
    recommendedProject: {
      title: track.projectTitle,
      summary: track.project,
      reason: track.projectReason,
      milestones: track.projectMilestones,
      resourceLinks: track.projectLinks,
    },
    thirtyDayPhases,
    yearPlan,
    thirtyDayTasks: flattenedTasks,
    sourceMode: "baseline",
  };
}

export const SAMPLE_STUDENTS: SampleStudentPreset[] = [
  {
    id: "sample-cse-ml",
    label: "Demo Student • CSE (AI/ML) 2nd Yr → ML Engineer (Google)",
    shortBranch: "CSE (AI/ML) → ML Engineer",
    form: {
      name: "Demo Student",
      branch: "CSE (AI/ML)",
      year: "2nd Year",
      goal: "Internship",
      companySelection: "Google",
      customCompany: "",
      role: "ML Engineer",
      skills: "Python, NumPy, pandas, basic Scikit-learn",
      projects: "Crop Leaf Disease Classifier (CNN notebook)",
      jobSourceUrl: "https://careers.google.com/jobs/ml-intern-sample",
      jdText: SAMPLE_JDS["ML Engineer"],
    },
    levels: {
      "Python": "Know it",
      "Statistics": "Know it",
      "Linear algebra basics": "Know it",
      "NumPy/pandas": "Know it",
      "Scikit-learn or PyTorch": "Know it",
      "Model evaluation": "Learning it",
      "Data pipelines": "Learning it",
      "Experiment tracking": "Need to learn",
      "Model deployment / APIs": "Need to learn",
    },
    evidence: {
      githubUrl: "https://github.com/demo-student-ml/crop-disease-vision",
      demoUrl: "https://huggingface.co/spaces/demo-ml/crop-leaf-demo",
      resumeUrl: "https://drive.google.com/file/d/demo-student-btech-resume",
      certificateUrl: "https://coursera.org/verify/ml-specialization-demo",
      skillEvidenceMap: {
        "Python": "https://github.com/demo-student-ml/crop-disease-vision/tree/main/src",
        "NumPy/pandas": "https://github.com/demo-student-ml/crop-disease-vision/blob/main/preprocess.py",
        "Scikit-learn or PyTorch": "https://github.com/demo-student-ml/crop-disease-vision/blob/main/train.py",
      },
    },
    doneTasks: [],
    applications: [
      {
        id: "app-1",
        company: "Google",
        role: "ML Engineer Intern",
        locationOrMode: "Bengaluru · Hybrid",
        status: "Building Proof",
        deadlineOrDate: "2026-11-15",
        evidenceShared: "GitHub Crop Classifier + HF Space Demo",
        notes: "Adding precision/recall error slicing and MLflow experiment tracking table.",
      },
    ],
  },
  {
    id: "sample-cse-backend",
    label: "Demo Student • CSE 3rd Yr → Backend Developer (Razorpay)",
    shortBranch: "CSE → Backend Developer",
    form: {
      name: "Demo Student",
      branch: "CSE (Computer Science & Engineering)",
      year: "3rd Year",
      goal: "Internship",
      companySelection: "Razorpay",
      customCompany: "",
      role: "Backend Developer",
      skills: "Java, Node.js, SQL, REST APIs, Git",
      projects: "Campus Study Room Booking API (Node + PostgreSQL)",
      jobSourceUrl: "",
      jdText: "",
    },
    levels: {
      "Data structures": "Know it",
      "HTTP/REST": "Know it",
      "One backend language": "Know it",
      "SQL": "Know it",
      "Authentication": "Learning it",
      "Git": "Know it",
      "Testing": "Need to learn",
      "Deployment": "Learning it",
    },
    evidence: {
      githubUrl: "https://github.com/demo-student-dev/campus-room-booking-api",
      demoUrl: "https://campus-rooms-api.onrender.com/health",
      resumeUrl: "https://drive.google.com/file/d/demo-student-backend-resume",
      certificateUrl: "",
      skillEvidenceMap: {
        "HTTP/REST": "https://github.com/demo-student-dev/campus-room-booking-api",
        "One backend language": "https://github.com/demo-student-dev/campus-room-booking-api",
        "Git": "https://github.com/demo-student-dev/campus-room-booking-api/commits/main",
      },
    },
    doneTasks: [],
    applications: [
      {
        id: "app-sde-1",
        company: "Razorpay",
        role: "Backend Developer Intern",
        locationOrMode: "Bengaluru · On-site",
        status: "Building Proof",
        deadlineOrDate: "2026-11-05",
        evidenceShared: "GitHub Booking API Repo",
        notes: "Adding JWT Authentication middleware and automated integration tests.",
      },
    ],
  },
  {
    id: "sample-it-data",
    label: "Demo Student • IT 3rd Yr → Data Analyst (Deloitte)",
    shortBranch: "IT → Data Analyst",
    form: {
      name: "Demo Student",
      branch: "Information Technology (IT)",
      year: "3rd Year",
      goal: "Placement",
      companySelection: "Deloitte",
      customCompany: "",
      role: "Data Analyst",
      skills: "SQL, Excel, Python/pandas, Power BI",
      projects: "Retail Supply Chain KPI Dashboard",
      jobSourceUrl: "https://jobs.deloitte.com/data-analyst-sample",
      jdText: SAMPLE_JDS["Data Analyst"],
    },
    levels: {
      "SQL": "Know it",
      "Excel/Sheets": "Know it",
      "Statistics": "Learning it",
      "Python/pandas": "Know it",
      "Dashboards": "Know it",
      "Communication": "Learning it",
      "Power BI or Tableau": "Know it",
      "Data cleaning & validation": "Know it",
    },
    evidence: {
      githubUrl: "https://github.com/demo-analytics/retail-sql-case-study",
      demoUrl: "https://app.powerbi.com/view?r=demo-retail-dashboard",
      resumeUrl: "https://drive.google.com/file/d/demo-student-analyst-resume",
      certificateUrl: "https://coursera.org/verify/google-data-analytics-demo",
      skillEvidenceMap: {
        "SQL": "https://github.com/demo-analytics/retail-sql-case-study/blob/main/queries.sql",
        "Dashboards": "https://app.powerbi.com/view?r=demo-retail-dashboard",
      },
    },
    doneTasks: [],
    applications: [
      {
        id: "app-da-1",
        company: "Deloitte",
        role: "Analyst — Data & Decision Science",
        locationOrMode: "Hyderabad · Hybrid",
        status: "Applied",
        deadlineOrDate: "2026-10-29",
        evidenceShared: "Power BI Dashboard + SQL Case Study Repo",
        notes: "Preparing hypothesis testing & statistical significance interview questions.",
      },
    ],
  },
  {
    id: "sample-ece-embedded",
    label: "Demo Student • ECE 3rd Yr → Embedded Systems (Qualcomm)",
    shortBranch: "ECE → Embedded Engineer",
    form: {
      name: "Demo Student",
      branch: "ECE (Electronics & Communication)",
      year: "3rd Year",
      goal: "Internship",
      companySelection: "Qualcomm",
      customCompany: "",
      role: "Embedded Systems Engineer",
      skills: "C, C++, STM32, UART/I2C",
      projects: "STM32 Environmental Telemetry Node",
      jobSourceUrl: "https://qualcomm.com/careers/embedded-intern",
      jdText: SAMPLE_JDS["Embedded Systems Engineer"],
    },
    levels: {
      "C/C++": "Know it",
      "Microcontrollers": "Know it",
      "UART/I2C/SPI": "Know it",
      "Debugging": "Learning it",
      "Digital fundamentals": "Know it",
      "RTOS basics": "Need to learn",
      "PCB or simulation tools": "Learning it",
    },
    evidence: {
      githubUrl: "https://github.com/demo-ece/stm32-i2c-telemetry",
      demoUrl: "https://wokwi.com/projects/demo-stm32-sensor-node",
      resumeUrl: "https://drive.google.com/file/d/demo-student-ece-resume",
      certificateUrl: "https://nptel.ac.in/noc/demo-embedded-systems",
      skillEvidenceMap: {
        "C/C++": "https://github.com/demo-ece/stm32-i2c-telemetry",
        "Microcontrollers": "https://wokwi.com/projects/demo-stm32-sensor-node",
      },
    },
    doneTasks: [],
    applications: [
      {
        id: "app-ece-1",
        company: "Qualcomm",
        role: "Embedded Firmware Engineering Intern",
        locationOrMode: "Hyderabad · On-site Lab",
        status: "Building Proof",
        deadlineOrDate: "2026-11-12",
        evidenceShared: "Wokwi STM32 Simulation + GitHub Repo",
        notes: "Implementing FreeRTOS task scheduling and SPI driver timing capture.",
      },
    ],
  },
  {
    id: "sample-mech-design",
    label: "Demo Student • Mechanical 4th Yr → Mechanical Design",
    shortBranch: "Mechanical → Design Engineer",
    form: {
      name: "Demo Student",
      branch: "Mechanical Engineering",
      year: "4th Year",
      goal: "Placement",
      companySelection: "Other",
      customCompany: "Tata Motors",
      role: "Mechanical Design Engineer",
      skills: "SolidWorks, AutoCAD, Strength of Materials",
      projects: "Formula Student Suspension Upright CAD",
      jobSourceUrl: "",
      jdText: "",
    },
    levels: {
      "Engineering drawing": "Know it",
      "3D CAD (SolidWorks/Fusion 360)": "Know it",
      "Materials & manufacturing": "Know it",
      "First-principles load calculations": "Learning it",
      "GD&T": "Need to learn",
      "FEA simulation (ANSYS)": "Learning it",
      "Communication": "Know it",
    },
    evidence: {
      githubUrl: "https://grabcad.com/library/demo-fsae-suspension-upright",
      demoUrl: "https://drive.google.com/file/d/demo-cad-portfolio-pdf",
      resumeUrl: "https://drive.google.com/file/d/demo-student-mech-resume",
      certificateUrl: "https://solidworks.com/cert/cswa-demo",
      skillEvidenceMap: {
        "3D CAD (SolidWorks/Fusion 360)": "https://grabcad.com/library/demo-fsae-suspension-upright",
      },
    },
    doneTasks: [],
    applications: [
      {
        id: "app-mech-1",
        company: "Tata Motors",
        role: "Mechanical Design Engineer (GET)",
        locationOrMode: "Pune · On-site",
        status: "Applied",
        deadlineOrDate: "2026-11-18",
        evidenceShared: "GrabCAD Upright Assembly + CSWA Certificate",
        notes: "Adding GD&T callouts and ANSYS Von Mises stress convergence report.",
      },
    ],
  },
];
