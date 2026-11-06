# FairDrop project instructions

- Read `docs/PRD.md` and `docs/ROADMAP.md` before implementing features.
- The active milestone is **Phase 1: World ID verification and event-scoped duplicate-claim prevention**.
- Do not implement Arkiv or Arc yet; keep future integration points isolated and inactive.
- Use TypeScript and follow the frontend/backend workspace boundaries.
- Verify World proofs on the backend using the current official World integration flow. Never trust a client-side success flag.
- Enforce event-scoped duplicate claims with an atomic database operation and the PRD's unique constraint.
- Do not store private keys or unnecessary identity data. Never commit secrets.
- Do not invent partner SDK methods, API routes, or config fields. Check official docs before integration.
- Keep changes small, tested, and documented. Record meaningful AI assistance in `docs/AI_USAGE.md`.
