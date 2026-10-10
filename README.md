# VisionPath

> **Prepare for the role you want, not a random list of skills.**

VisionPath is an AI-powered career planning assistant for BTech students. It helps students plan the skills, projects, internships, and placement preparation needed for a specific target role across all four years of their degree.

## Problem

BTech students often learn disconnected technologies without knowing what a target internship or placement role actually expects. VisionPath turns a goal such as “I want a backend internship” into a clear, evidence-based plan:

- identify role-specific requirements;
- compare them with current knowledge and project evidence;
- prioritize the largest skill gaps;
- recommend one practical project that creates proof; and
- build a year-wise roadmap from the current year to graduation.

## What the app does

1. **Goal** — Collects branch, current BTech year, internship or placement goal, optional company, target role, and optional job description.
2. **Role requirements** — Uses curated role profiles or extracts requirements from a supplied job description. Company names alone never create invented requirements.
3. **Skill check** — Lets students rate role-critical skills as **Know it**, **Learning it**, or **Need to learn**.
4. **Gap analysis** — Shows current versus target levels, evidence status, and high, medium, or low priority gaps. This is guidance, not a hiring prediction.
5. **Action plan** — Recommends the top three gaps, what to learn first, one practical project, and the proof that project should produce.
6. **Year-wise roadmap** — Organizes skills, projects, internships, placement preparation, outputs, and evidence for Years 1–4.
7. **Progress dashboard** — Includes a 30-day checklist, progress percentage, evidence links, PDF/print export, saved local progress, and an internship tracker.

## How the demo works

Student profile → Target role or supplied job description → Skill check + evidence → Visual gap analysis → Prioritized actions → Project proof → Year-wise roadmap

## AI and technical approach

VisionPath uses a hybrid approach so the result stays useful and explainable.

- **Gemini** extracts structured requirements from a supplied job description and personalizes explanations and recommendations.
- **Deterministic scoring** compares the student's self-assessed level and evidence with the role target. Required skills receive higher priority than preferred skills.
- **Role profiles and fallbacks** keep the demo usable when Gemini is unavailable or a job source is missing.
- **Source transparency** clearly labels when company-specific requirements are not verified. The model is not asked to generate resource URLs, preventing invented links.
- **Reliability** uses gemini-3.8-flash, a strict 20-second timeout for Gemini calls, and one retry for invalid JSON before safe fallback behavior.

VisionPath does not predict hiring decisions or guarantee selection.

## Technology

- React + TypeScript
- Vite
- Express server
- Google Gemini via @google/genai
- Responsive editorial UI with Nunito typography
- Browser localStorage for prototype progress

## Run locally

### Requirements

- Node.js 18 or newer
- A Gemini API key for live Gemini requests

### Install and start

npm install

Create .env in the project root with:

GEMINI_API_KEY=your_key_here

Then run:

npm run dev

The terminal will print the local development URL. Never commit .env or an API key.

## Demo links

- **Live product:** https://ais-dev-jvcwknpxxc6cfe7ud3kvix-721558726448.asia-southeast1.run.app/
- **Google AI Studio app:** https://aistudio.google.com/apps/994eb3af-c819-4f94-9f19-52b198db89ee

## Suggested judge walkthrough

1. Start the sample demo.
2. Choose a branch, year, internship or placement goal, company if relevant, and target role.
3. Review the role-specific requirements.
4. Rate the skills using the three quick choices.
5. Show the readiness signal and prioritized visual gap chart.
6. Explain the top three actions and practical project.
7. Open the year-wise roadmap and mark one progress task complete.
8. Show the evidence section and download the plan.

## Limitations

This is a hackathon prototype. Progress is stored locally in the browser, there are no user accounts, and skill levels are self-reported. Recommendations depend on the supplied job description and should be reviewed by the student. Job requirements can change over time.

## Team

Built for the Tricity AI-Thon 2026 by the VisionPath team.

## License

Hackathon prototype.
