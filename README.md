# VisionPath

### Prepare for the role you want, not a random list of skills.

VisionPath is an AI-powered career planning assistant for BTech students. It helps a student turn a vague goal such as “I want an ML internship” into a practical, evidence-based preparation plan.

The app compares a student's current skills and project evidence with the requirements of a target internship or placement role. It then highlights the most important gaps, recommends what to learn and build next, and creates a year-wise roadmap from the student's current year to graduation.

## Why this matters

BTech students often spend months learning disconnected technologies. They may know the name of a target company but still not know:

- which skills the target role actually expects;
- which skills they already have enough evidence for;
- which gaps should be addressed first;
- what project can prove their ability; and
- how to plan preparation across the remaining years of their degree.

VisionPath connects the target role to the student's current position and gives them a clear next step.

## Core features

1. **Student profile** – Collects branch, current year, goal, target role, optional company, current skills, and existing projects.
2. **Role requirements** – Uses a sample role profile or a job description supplied by the student. Requirements are organized into required skills, preferred skills, and responsibilities.
3. **Skill self-assessment** – Lets students describe their level for every role skill, from “Don't know” to “Used in real work”.
4. **Evidence capture** – Accepts GitHub, project demo, résumé, certificate, or portfolio links.
5. **Visual gap analysis** – Shows the student's status, evidence status, gap priority, and a simple explanation for each skill.
6. **Personalized guidance** – Recommends the top gaps, learning order, a practical project task, and the evidence that task should produce.
7. **Four-year roadmap** – Adapts the plan to the student's current year and target role.
8. **Progress dashboard** – Includes task checkboxes, progress percentage, project links, and an internship tracker.

## How the demo works

```text
Student profile
      ↓
Target role or supplied job description
      ↓
Skill self-assessment + evidence
      ↓
Weighted skill-gap analysis
      ↓
Prioritized actions and project task
      ↓
Year-wise roadmap and progress tracker
```

## AI and technical approach

VisionPath uses a hybrid approach so that the product is both useful and explainable.

- **Gemini** understands a supplied job description and extracts structured information such as required skills, preferred skills, and responsibilities. It also helps write personalized explanations and recommendations.
- **Deterministic gap analysis** compares the target level for a skill with the student's self-assessed level and evidence. Required skills receive higher priority than preferred skills, and gaps are classified as high, medium, or low.
- **Fallback role profiles** keep the demo usable when Gemini is unavailable. The app can still calculate gaps from supported sample roles.
- **Role-source transparency** prevents the app from inventing company requirements. A company name by itself is not treated as a job specification; the student must provide a job description or use a general role profile.

VisionPath is a preparation planner. It does not predict hiring decisions or guarantee selection.

## Technology

- React and TypeScript user interface
- Responsive, mobile-friendly design
- Gemini-powered requirement extraction and personalization
- Client-side progress and assessment state for the prototype
- Structured role profiles and rule-based gap scoring for reliable fallback behavior

## Running the project

### Google AI Studio demo

The hackathon demo is built in Google AI Studio. Open the shared AI Studio app link, run the preview, and start with one of the sample role flows. The sample data allows the complete experience to be demonstrated immediately.

### Running an exported source version

Create a `.env` file in the project root with `GEMINI_API_KEY=your_key_here` (see `.env.example`). The key is read only by the Express server and is never sent to the browser. Never commit `.env`.

Open the local URL printed by the development server. If Gemini access is enabled in the exported version, add the required API key using the environment-variable format documented by the exported project. Never commit API keys to GitHub.

## Demo walkthrough

For a quick presentation, use this example:

1. Select `CSE (AI/ML)` and the student's current year.
2. Choose `Internship` and `ML Engineer Intern`.
3. Add current skills such as Python and basic machine learning.
4. Leave deployment, MLOps, or project evidence at a lower level.
5. Review the visual gap chart and the high-priority gaps.
6. Show the recommended project task and the four-year roadmap.
7. Mark a task complete and add a project link in the progress dashboard.

## Product principles

- Start with the student's target role, not a generic course list.
- Explain why every recommendation was made.
- Separate required skills from preferred skills.
- Treat evidence as different from self-reported knowledge.
- Show uncertainty when a reliable job source is missing.
- Give students one practical next action instead of overwhelming them with text.

## Limitations and future scope
Current prototype limits: progress is stored in the browser (localStorage), not in the cloud; there are no user accounts; skill levels are self-reported; AI output can be imperfect and should be reviewed by the student.
The quality of recommendations depends on the supplied job description and the accuracy of the student's self-assessment. Job requirements also change over time. Future versions can add:

- verified career-page and job-board integrations;
- résumé and GitHub portfolio analysis;
- short skill assessments to validate self-reported levels;
- mentor and placement-cell feedback;
- reminders, accounts, and secure cloud synchronization; and
- analytics for colleges and training programs.

## Team

Built for the **Tricity AI-Thon 2026** hackathon by the VisionPath team.


## License

This project was created as a hackathon prototype.
