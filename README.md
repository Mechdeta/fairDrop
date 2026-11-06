# FairDrop

**The Bot-Proof Ticket Marketplace** — a hackathon MVP focused on fairer ticket allocation through privacy-preserving unique-human verification.

## Current build focus

We are deliberately building in phases. **Phase 1 is World ID verification and event-scoped duplicate-claim prevention.** Arkiv and Arc are reserved for later phases; they are not part of the initial implementation.

The homepage and API health endpoint are starter scaffolding only. World ID verification, database persistence, ticket allocation, Arkiv, and Arc are not implemented yet.

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Planned operational database: PostgreSQL
- Identity integration in the active phase: World ID

## Start here

The shared starter project is on the `dev` branch. After cloning, switch to it before installing dependencies:

```bash
git clone https://github.com/Mechdeta/fairDrop.git
cd fairDrop
git switch dev
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- API health check: http://localhost:4000/api/health

Run checks:

```bash
npm run typecheck
npm run build
```

## Repository workflow

- `main`: stable, demo-ready work.
- `dev`: shared integration branch.
- `feature/<short-name>`: individual tasks, opened as pull requests into `dev`.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for team workflow, [docs/PRD.md](./docs/PRD.md) for the active implementation brief, and [docs/ROADMAP.md](./docs/ROADMAP.md) for milestones.

## AI assistance

Record substantial AI-assisted work, prompts, human review, and tests in [docs/AI_USAGE.md](./docs/AI_USAGE.md), in line with the hackathon's AI-use disclosure requirements.
