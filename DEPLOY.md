# Deploying AI-Native RCM to Render

This project deploys as **three** Render resources, all defined in
[`render.yaml`](./render.yaml):

| Resource       | What it is                                   | Plan |
| -------------- | -------------------------------------------- | ---- |
| `rcm-db`       | Managed PostgreSQL                           | free |
| `rcm-backend`  | FastAPI backend (Docker, includes Tesseract) | free |
| `rcm-frontend` | Next.js dashboard                            | free |

The backend is a **consolidation** of the old orchestrator + 6 agent containers
into a single FastAPI process under [`backend/`](./backend). The agents are
called in-process (no Redis, no inter-service HTTP, no shared volume needed).
The original `orchestrator/`, `agents/`, and `compose.yml` are kept for
reference but are **not** used by the Render deploy.

---

## 1. Push this repo to GitHub

Render deploys from a Git repo. From the project root:

```bash
git add -A
git commit -m "Consolidate backend + add Render deploy config"
# create the repo (needs the GitHub CLI `gh`, or create it in the GitHub UI):
gh repo create ai-native-rcm --private --source . --remote origin --push
```

If you don't have `gh`, create an empty repo on github.com, then:

```bash
git remote add origin https://github.com/<you>/ai-native-rcm.git
git push -u origin master
```

## 2. Create the Blueprint on Render

1. Go to **https://dashboard.render.com** → **New** → **Blueprint**.
2. Connect your GitHub account and pick this repo.
3. Render reads `render.yaml` and shows the 3 resources. Click **Apply**.

## 3. Add the secret API keys

The two LLM keys are intentionally **not** in git. After the blueprint applies:

1. Open the **rcm-backend** service → **Environment**.
2. Set these (use your own freshly rotated keys):
   - `CO_API_KEY` = your Cohere key
   - `COHERE_API_KEY` = same Cohere key
   - `OPENAI_API_KEY` = your OpenAI key
3. **Save** → the backend redeploys.

> The DB URL and the frontend→backend URL are wired automatically by the blueprint.

## 4. Use it

- Frontend URL: the **rcm-frontend** service URL (e.g. `https://rcm-frontend.onrender.com`).
- Log in (any email/password — auth is a stub), go to **Dashboard → Eligibility Checks**,
  and drag in a sample card from [`sample_media/`](./sample_media) to trigger a full workflow run.

---

## Things to know about the free tier

- **Cold starts:** free services sleep after ~15 min idle. The first request
  after sleeping takes ~30–60s. The first run also OCR-processes + makes several
  LLM calls, so it can take a while (the UI says so).
- **Free Postgres expires after 30 days.** Render will email you; you'll need to
  create a fresh DB and update `DATABASE_URL` (or move to a non-expiring free DB
  like Neon/Supabase). The schema auto-creates on backend startup.
- **Ephemeral disk:** uploaded files go to `/tmp` and are not persisted across
  restarts — fine here since they're only needed during the run.

## Running locally (optional, no Docker)

You still need Python, Node, and Tesseract installed, plus a Postgres URL
(a free Neon/Supabase DB works — no local DB install):

```bash
# backend
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://..."   # your managed DB
export CO_API_KEY="..."  COHERE_API_KEY="..."  OPENAI_API_KEY="..."
python app.py            # serves on http://localhost:9000

# frontend (separate terminal)
cd ai_native_rcm_frontend
npm install
echo 'NEXT_PUBLIC_BACKEND_API_URL=http://localhost:9000' > .env.local
echo 'BACKEND_API_URL=http://localhost:9000' >> .env.local
npm run dev              # http://localhost:3000
```
