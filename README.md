<div align="center">

<img src="./public/brand/roleready-mark.svg" alt="RoleReady" width="72" height="72" />

# RoleReady

**Outcome-first: ready for the role**

AI resume builder — ATS-friendly templates, STAR bullet rewrites, job matching, cover letters, and PDF export.

[Live Demo](https://role-ready.vercel.app) · [Report Bug](https://github.com/adimishra16/RoleReady/issues) · [Request Feature](https://github.com/adimishra16/RoleReady/issues)

<br />

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-Auth%20%2B%20DB-FD366E?style=flat-square)
![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)

</div>

---

## Why RoleReady?

Walk into every application prepared. RoleReady helps you rewrite weak bullets into quantified impact, match your resume to a job description, generate a tailored cover letter, and export a clean PDF — with AI usage controlled per account.

| | |
|---|---|
| **AI Co-Pilot** | Bullet rewrite (STAR/XYZ), executive summary, job match %, cover letters |
| **Live Builder** | Split editor + preview, section reorder, theme & fonts, autosave |
| **4 Templates** | Modern, Minimal ATS, Executive, Creative |
| **Export & Share** | PDF after sign-in · public `/share/[slug]` link |
| **Account limits** | Up to **3** resumes per user · AI quotas via Appwrite `users` |

---

## Features

### AI Career Co-Pilot
- **Bullet rewriter** — stream weak bullets into quantified, action-verb lines
- **Job matcher** — paste a JD → match score + missing keywords checklist
- **Summary generator** — synthesize experience into a strong profile summary
- **Cover letter** — tailor tone and content to the employer
- **Gated usage** — global + per-user AI flags and rewrite/other limits in Neon

### Resume Builder
- Sections: personal, summary, experience, education, skills, projects, certifications, languages
- Drag / reorder, zoom controls, mobile edit ↔ preview
- Debounced autosave (localStorage + Neon when signed in)

### Templates & Export
- Four ATS-friendly layouts with color palettes and font pairings
- High-fidelity PDF download (signed-in users)
- Shareable public resume URL

### Auth & Dashboard
- Clerk email sign-in (phone fields hidden in UI)
- User row synced to Neon on sign-in (+ optional Clerk webhook)
- Onboarding for target role / industry
- Create, duplicate, rename, search, delete (max 3 resumes)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15** (App Router, Server Actions, Route Handlers) |
| Language | **TypeScript** |
| UI | **Tailwind CSS** + Lucide |
| Database | **Neon** serverless Postgres |
| ORM | **Drizzle ORM** + Drizzle Kit |
| Auth | **Clerk** |
| AI | **Vercel AI SDK** · Nebius (preferred) · OpenAI / Google fallbacks |
| PDF | html2canvas + jsPDF / print pipeline |
| Webhooks | **Svix** (Clerk signature verify) |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/adimishra16/RoleReady.git
cd RoleReady
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` (never commit it):

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | For auth/DB | Appwrite API endpoint (e.g. `https://cloud.appwrite.io/v1`) |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | For auth/DB | Appwrite project id |
| `APPWRITE_API_KEY` | For SSR auth + admin DB | Server API key (add when ready) |
| `APPWRITE_DATABASE_ID` | For cloud data | Database id (default `roleready`) |
| `APPWRITE_COLLECTION_*` | Optional | Override collection ids (see `.env.example`) |
| `NEBIUS_API_KEY` | For AI | [Nebius Token Factory](https://tokenfactory.nebius.com/project/api-keys) |
| `NEBIUS_MODEL` | Optional | Default: `deepseek-ai/DeepSeek-V4-Flash-0731` |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` locally; production host on Vercel |
| `AI_REWRITE_DEFAULT_LIMIT` | Optional | Default rewrite quota (e.g. `15`) |
| `AI_OTHER_DEFAULT_LIMIT` | Optional | Default other AI quota (e.g. `10`) |
| `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | Fallbacks if Nebius unset |

> **Demo mode:** Without Appwrite endpoint/project (or API key), the app still runs locally with demo resumes.

### 3. Appwrite (Auth + Database)

1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io) (or self-host)
2. Add a **Web** platform with hostname `localhost`
3. Enable **Email/Password** auth
4. Create an API key with `users.read`, `users.write`, `sessions.write`, `databases.read`, `databases.write`
5. Point `APPWRITE_DATABASE_ID` + collection ids at your migrated database
6. Promote an admin by setting `role = "admin"` on that user’s document in the `users` collection

### 4. Auth notes

- Sign-in / sign-up use Appwrite email+password via `/api/auth/*` (HTTP-only session cookie)
- On login, the app upserts the Auth user into the Appwrite `users` collection (`/api/users/sync`)
- Clerk webhooks are disabled (`/api/webhooks/clerk` returns 410)

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Sign-in / sign-up
│   ├── (dashboard)/            # Dashboard + onboarding
│   ├── builder/[resumeId]/     # Live builder
│   ├── share/[slug]/           # Public resume
│   ├── api/
│   │   ├── ai/                 # rewrite, summary, match, cover, status
│   │   ├── auth/               # Appwrite sign-in / sign-up / me / sign-out
│   │   ├── users/sync/         # Appwrite Auth → users collection upsert
│   │   └── webhooks/razorpay/  # Billing events
│   └── page.tsx                # Landing
├── components/
│   ├── brand/                  # Logo, auth nav
│   ├── builder/                # Editors + AI modals
│   ├── shared/                 # AuthProvider, theme, sync
│   └── templates/              # Resume templates
├── lib/
│   ├── appwrite/               # Auth + Databases clients & repos
│   ├── actions/                # Server actions
│   └── ai/                     # Providers, access gates
├── middleware.ts               # Protect /admin + /profile via session cookie
└── ...
```

---

## Security notes

- **Ownership** — save / delete / share actions require an Appwrite session and verify the resume belongs to that user.
- **Create** — with the DB configured, client-supplied `userId` is ignored; ownership comes from the session.
- **API key** — `APPWRITE_API_KEY` stays server-only; never expose it to the browser.

---

## Deploy on Vercel

1. Import [adimishra16/RoleReady](https://github.com/adimishra16/RoleReady) into [Vercel](https://vercel.com)
2. Set env vars (same as `.env.example`), especially:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT` / `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY` / `APPWRITE_DATABASE_ID`
   - `NEBIUS_API_KEY` (and optional model / AI limits)
   - `NEXT_PUBLIC_APP_URL=https://your-deployment.vercel.app`
3. Deploy

---

## Current status

Suitable for **beta / testing**. Core builder UX works; cloud resume load/save is still evolving (localStorage remains the primary editor cache). Middleware protects `/admin` and `/profile` — rely on action-level auth for mutations.

---

## License

Private — all rights reserved unless otherwise stated by the owner.

---

<div align="center">

<img src="./public/brand/roleready-logo.png" alt="RoleReady" width="220" />

<br />

**Ready for the role.**

</div>
