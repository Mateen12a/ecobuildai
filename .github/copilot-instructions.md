<!-- Copilot / AI agent instructions for the EcoBuild AI repository -->
# Quick Orientation for AI Coding Agents

This file contains concise, actionable guidance to help an AI code assistant be immediately productive in this repo.

**Big Picture**
- **Frontend**: `client/` — React + TypeScript app built with `vite`. Entry: `client/src/main.tsx`. Dev: `npm run dev` from root runs server + client when appropriate; see `package.json`.
- **Backend (API + ML studio)**: primary Node server code lives under `server/` (TypeScript entry `server/index.ts` compiled with `esbuild`). A separate ML studio backend lives at `MLStudio-main/server/server.js` (plain Node). ML training runs in `MLStudio-main/worker/` (Python).
- **Data flow**: uploads → processed by `server` (Sharp) → stored as binary in MongoDB via `MaterialImage` schema → ML training worker reads MongoDB, writes model files into `data/models/` (or `MLStudio-main` worker manages its own `data/models/`).

**Key Files & Patterns (reference examples)**
- `server/server.js` (or `server/index.ts`): central Express routes for API, WebSocket training progress broadcast (`/ws`), and ML orchestration.
- `MLStudio-main/worker/train.py`: canonical training pipeline (3-phase unfreeze, augmentation). Use it as source of truth for training hyperparameters and output artifacts (`model.keras`, `labels.json`, `metadata.json`).
- `server/config/materials.js` and `MLStudio-main/server/config/materials.js`: the ICE materials list — add new material keys here to expose them across the app.
- `server/models/*.js` (or `server/db/models/*.ts`): Mongoose schemas for `MaterialImage`, `TrainedModel`, `CustomMaterial`. Update schemas here when changing how training data is stored.
- `MLStudio-main/server/server.js`: handles training lifecycle APIs (`/api/training/start`, `/api/training/stop`) and spawns the Python worker — follow its patterns for emitting JSON training events on stdout.

**Developer Workflows & Commands**
- Install (root): `npm install` (also run `npm run install:all` inside `MLStudio-main` to install that subproject).
- Dev (root): `npm run dev` — runs the TypeScript server in watch mode (`tsx`) and frontend dev server via Vite.
- Build: `npm run build` — runs Vite build then bundles server with `esbuild` to `dist/`.
- Start (prod): `npm run start` (runs `node dist/index.js`).
- ML Studio local dev: from `MLStudio-main`: `npm run dev` runs both `server` and `client`; to run only server: `cd MLStudio-main/server && node server.js`.

**Environment & Infra Notes**
- MongoDB: connection string used by default in code is `MONGO_URI` (fallback in `server.js` points to `Construction_test`). Prefer production `MONGODB_URI`/`MONGO_URI` in env.
- Python worker: virtualenv expected at `worker/tfenv` (see `server.js` python path resolution). Ensure TensorFlow 2.20+ compatible environment for `train.py`.
- Important env vars: `MONGODB_URI` / `DATABASE_URL` (drizzle configs), `JWT_SECRET`, `NODE_ENV`.

**Project-Specific Conventions**
- Image preprocessing: images are resized to `224x224` using `sharp` before storage and training — follow this exact shape for inference and augmentation code.
- Uploaded images validated in `server` with Multer (max 10MB, allowed types `jpeg|png|webp`). Keep these constraints when adding new upload endpoints.
- ML training orchestration: Node backend spawns Python training and listens to JSON lines on stdout. Training events are expected as JSON per-line; use `console.log(JSON.stringify(event))` in the Python worker to interoperate.
- Model artifacts: models and labels are stored under `data/models/<modelId>/` — look for files `model.keras`, `best_model.keras`, `labels.json`, `metadata.json` when syncing or activating models.

**Common Code Tasks & Where to Make Changes**
- Add a new material class: update `server/config/materials.js` and `MLStudio-main/server/config/materials.js`, then add training images via the ML Studio UI or `MLStudio-main/worker/add_training_images.py`.
- Expose a new API route: follow existing pattern in `server/index.ts` (feature-based route modules under `routes/`); include auth middleware from `middleware/auth.ts` when required.
- Extend training metadata: update the `TrainedModel` Mongoose schema and ensure the Python worker emits matching fields in `metadata.json`.

**Testing & Debugging Tips**
- Reproduce training locally: start MongoDB with the dataset, run `MLStudio-main/server/server.js`, then call `/api/training/start` using Postman or the ML Admin UI. Watch WebSocket `/ws` for progress messages.
- Inspect model files: after training, check `data/models/<modelId>/` for `labels.json` and `metadata.json` before calling `/api/models/:id/sync`.
- Logs: backend logs training stderr and forwards them via WebSocket; check both terminal running the Python worker and the Node server logs for root causes.

If anything above is unclear or you want more examples (tests, mutation flows, or a walkthrough of the training stdout events), tell me which area to expand and I'll iterate.
