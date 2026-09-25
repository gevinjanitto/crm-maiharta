# CRM Maiharta — PRD / Work Log

## Problem Statement
User's repo (github.com/gevinjanitto/crm-maiharta) failed to build on Railway:
`ERROR: Invalid requirement: '<<<<<<< HEAD' (from line 2 of requirements.txt)`.

## Root Cause
The latest commit `63e7822` ("revisiii bro") was a botched Git merge (of `55f5c63` and
`0641a06`) that committed **unresolved conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`)
into 46 files — including `backend/requirements.txt`, which broke the Railway/nixpacks
`pip install`. The `SEED_PASSWORD`/`SMTP_PASSWORD`/`RECAPTCHA_SITE_KEY` messages in the log
were only non-fatal nixpacks warnings, not the failure.

## Fix (2026-06)
- Restored all conflicted files to the last clean commit `55f5c63` ("compiles clean / deploy ready").
- Manually resolved one leftover marker in `frontend/.env.example`.
- Copied the clean project into `/app`, preserving pod `.env` values (MONGO_URL, DB_NAME,
  REACT_APP_BACKEND_URL) and adding required app keys (JWT_SECRET, SEED_*, RECAPTCHA_*).
- Verified: 0 conflict markers, backend `/api/health` = ok, frontend login page renders.

## Stack
- Backend: FastAPI + Motor/MongoDB. Entrypoint `server.py` (`uvicorn server:app`). Routers:
  auth, projects, administration, tickets, kanban, finance, audit. Deploy via `railway.json`
  (NIXPACKS) + `Procfile`, healthcheck `/api/health`.
- Frontend: React (CRACO), CRM workspace UI. Deploy via Vercel (`vercel.json` SPA rewrite).

## Notes / Backlog
- reCAPTCHA site key must be registered for the deployed domain (Railway/Vercel URL).
- Document uploads use Cloudinary (env keys required, else 503) — not mocked, awaiting creds.
