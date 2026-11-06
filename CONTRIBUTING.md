# Contributing to FairDrop

Our active milestone is **Phase 1: World ID verification and event-scoped duplicate-claim prevention**.

## Branch workflow
- `main`: stable, demo-ready work. Do not push feature work directly here.
- `dev`: shared integration branch.
- Create task branches from `dev`: `feature/<task>`, `fix/<task>`, or `docs/<task>`.
- Open pull requests into `dev` and request at least one teammate review.
- Keep pull requests focused and explain how you tested the change.

## Commit messages
Use clear, action-oriented messages, e.g. `feat(world): add verification flow` or `fix(claims): reject duplicate event claims`.

## Local setup
1. Install Node.js 20.9 or newer.
2. Run `npm install` from the repository root.
3. Copy `backend/.env.example` to `backend/.env`.
4. Copy `frontend/.env.example` to `frontend/.env.local`.
5. Run `npm run dev` from the repository root.

Frontend: http://localhost:3000  
API: http://localhost:4000

## Before a PR
- Run `npm run typecheck`.
- Run `npm run build` when your change affects build output.
- Never commit secrets, private keys, real identity data, or local environment files.
- Update docs and record substantial AI assistance in `docs/AI_USAGE.md`.
- Do not begin Arkiv or Arc implementation until Phase 1 is complete.
