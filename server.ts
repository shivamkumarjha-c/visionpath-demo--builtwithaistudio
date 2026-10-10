import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // 1. Strict Job Description Extraction: Extracts ONLY from supplied text & flags missing information
  app.post("/api/gemini/extract-jd", async (req, res) => {
    try {
      const { jdText, jobSourceUrl, role, branch, company, goal } = req.body;
      const trimmedText = typeof jdText === "string" ? jdText.trim() : "";

      if (!trimmedText || trimmedText.length < 25) {
        res.status(400).json({
          error:
            "Company-specific requirements not verified: Job description text is missing or too short to extract verified requirements.",
        });
        return;
      }

      const ai = getGenAIClient();
      const prompt = `You are a strict, evidence-based technical recruiter analyzing a pasted Job Description for a BTech student (${branch || "Engineering"}, Goal: ${goal || "Internship"}) targeting "${role || "Engineering Role"}"${company ? ` at "${company}"` : ""}.
${jobSourceUrl ? `Supplied Job URL: ${jobSourceUrl}` : ""}

SUPPLIED JOB DESCRIPTION TEXT:
"""
${trimmedText}
"""

STRICT RULES:
1. Extract ONLY skills, responsibilities, and expected evidence that are EXPLICITLY stated or directly implied in the SUPPLIED JOB DESCRIPTION TEXT above.
2. DO NOT invent or hallucinate company requirements from the company name ("${company || "None"}") alone.
3. Separate skills into "required" (explicitly required/must-have in the text) and "preferred" (explicitly marked as preferred/bonus/nice-to-have in the text).
4. For every skill in "required" and "preferred", provide "skillDetails" with:
   - "skill": exact skill name
   - "tier": "Required" or "Preferred"
   - "whyItMatters": Why this skill matters based on the JD text and role context
   - "expectedEvidence": Concrete project, code, test, or portfolio evidence the student should show
   - "sourceSnippet": Exact quote or phrase from the pasted JD text
5. Identify what information is MISSING or AMBIGUOUS in the pasted text (e.g., "Preferred skills were not separately listed in the pasted text", "Specific tech stack versions were not specified", "Day-to-day responsibilities were not detailed", "Academic CGPA/branch cutoff was not mentioned") and return them in "missingInformationNotes".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "Never invent company-specific requirements from a company name. Extract only what is present in the supplied JD text and clearly report missing or unspecified information.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              required: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              preferred: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              responsibilities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              expectedEvidence: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              skillDetails: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING },
                    tier: { type: Type.STRING },
                    whyItMatters: { type: Type.STRING },
                    expectedEvidence: { type: Type.STRING },
                    sourceSnippet: { type: Type.STRING },
                  },
                  required: ["skill", "tier", "whyItMatters", "expectedEvidence", "sourceSnippet"],
                },
              },
              missingInformationNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedProject: { type: Type.STRING },
              recommendedProjectReason: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              "required",
              "preferred",
              "responsibilities",
              "expectedEvidence",
              "skillDetails",
              "missingInformationNotes",
              "recommendedProject",
              "recommendedProjectReason",
              "tasks",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error("Error in /api/gemini/extract-jd:", error);
      const message = error instanceof Error ? error.message : "Gemini API unavailable for JD extraction.";
      res.status(500).json({ error: message });
    }
  });

  // 2. Personalize Guidance, Gap Recommendations (with Reasons), and 4-Year + 30-Day Roadmap
  app.post("/api/gemini/personalize", async (req, res) => {
    try {
      const { profile, track, levels, evidenceLinks, gapSummary } = req.body;
      if (!profile || !track) {
        res.status(400).json({ error: "Missing student profile or role track." });
        return;
      }

      const ai = getGenAIClient();

      const prompt = `You are a Principal BTech Career Architect advising an engineering student.

STUDENT PROFILE:
- Name: ${profile.name || "BTech Student"}
- Degree / Branch: ${profile.branch}
- Current Academic Year: ${profile.year}
- Career Goal: ${profile.goal}
- Selected Company: ${profile.company || "Not specified"}
- Target Job Role: ${profile.role}
- Requirement Source Status: ${track.verificationStatusLabel}
- Current Skills Summary: ${profile.skills}
- Existing Projects Summary: ${profile.projects || "None listed yet"}

VERIFIED ROLE REQUIREMENTS:
- Required Skills: ${(track.required || []).join(", ")}
- Preferred Skills: ${(track.preferred || []).join(", ")}
- Responsibilities: ${(track.responsibilities || []).join(", ")}
- Expected Evidence: ${(track.expectedEvidence || []).join(", ")}

SELF-ASSESSMENT & EVIDENCE STATUS:
- Skill Levels: ${JSON.stringify(levels || {})}
- Portfolio & Skill Evidence Links: ${JSON.stringify(evidenceLinks || {})}
- Deterministic Readiness Summary: ${JSON.stringify(gapSummary || {})}

STRICT POLICY:
- Do NOT invent unverified company-specific hiring rules from the company name alone. Base all recommendations strictly on the verified role requirements above and the student's combination of branch (${profile.branch}) + goal (${profile.goal}) + target role (${profile.role}) + current year (${profile.year}).
- Provide an explicit "reason" for EVERY recommendation, task, and project milestone.

TASK:
1. "executiveSummary": 2-3 sentence candid readiness evaluation connecting their branch (${profile.branch}), current year (${profile.year}), goal (${profile.goal}), and target role (${profile.role}), noting whether company requirements are verified from a pasted JD or using the explicit role profile.
2. "recommendations": 4 prioritized action recommendations. Each must include "title", "priority", "targetSkills", "action", "reason" (explicit why), and "proofDeliverable".
3. "recommendedProject": { "title", "summary", "reason", "milestones" (4 items), "resourceLinks" (3 real canonical documentation links with "label", "url", "whyUseful") }
4. "yearPlan": 4-year BTech roadmap (Year 1 — Explore, Year 2 — Build, Year 3 — Experience, Year 4 — Launch) adapted to ${profile.year}, ${profile.branch}, ${profile.goal}, and ${profile.role}.
5. "thirtyDayTasks": 5 concrete tasks for the next 30 days, each with "task", "reason", and "targetSkill".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an evidence-based BTech career mentor. Never fabricate company-specific criteria if no JD was provided; ground every recommendation in the verified role skills and explain why each step matters.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    targetSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    action: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    proofDeliverable: { type: Type.STRING },
                  },
                  required: ["title", "priority", "targetSkills", "action", "reason", "proofDeliverable"],
                },
              },
              recommendedProject: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resourceLinks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        url: { type: Type.STRING },
                        whyUseful: { type: Type.STRING },
                      },
                      required: ["label", "url", "whyUseful"],
                    },
                  },
                },
                required: ["title", "summary", "reason", "milestones", "resourceLinks"],
              },
              yearPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    yearLabel: { type: Type.STRING },
                    stageTitle: { type: Type.STRING },
                    focusNote: { type: Type.STRING },
                    items: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["yearLabel", "stageTitle", "focusNote", "items"],
                },
              },
              thirtyDayTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    targetSkill: { type: Type.STRING },
                  },
                  required: ["task", "reason", "targetSkill"],
                },
              },
            },
            required: [
              "executiveSummary",
              "recommendations",
              "recommendedProject",
              "yearPlan",
              "thirtyDayTasks",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error("Error in /api/gemini/personalize:", error);
      const message = error instanceof Error ? error.message : "Gemini API quota or network error.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VisionPath server listening on http://localhost:${PORT}`);
  });
}

startServer();
