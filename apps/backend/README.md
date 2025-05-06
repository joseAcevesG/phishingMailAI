# 📱 Phishing Mail Detector - Backend Documentation

## 🔍 Overview

This backend powers the core logic of the Phishing Mail Detector project. Built with Node.js and Express, it follows a modular MVC folder structure. It provides:

- Magic link authentication via **Stytch**
- Secure `.eml` file upload and validation
- MongoDB integration for data persistence
- GPT-4o-powered phishing analysis
- Clean error handling and route validation

It is designed to work seamlessly with the frontend React SPA in the same monorepo.

## 🚀 Tech Stack

- **Framework:** Express.js (Node.js)
- **Database:** MongoDB
- **Authentication:** Stytch
- **AI Analysis:** OpenAI GPT-4o
- **Tooling:** pnpm, Biome

## ⚖️ Try the API

- Deployed at: [https://phishingmailai.onrender.com](https://phishingmailai.onrender.com)
- Example endpoints:

  - `POST /api/authenticate`
  - `GET /api/auth/status`
  - `POST /api/validate`

- Full API docs: [https://phishingmailai.onrender.com/api/docs](https://phishingmailai.onrender.com/api/docs)

> Tip: Use the [REST Client VS Code extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) with the provided `api_test.http` file.

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- pnpm
- MongoDB (local or cloud)
- Stytch account ([https://stytch.com](https://stytch.com))
- OpenAI API key ([https://openai.com](https://openai.com))

### Why pnpm?

`pnpm` is fast, efficient, and ideal for managing dependencies in a monorepo via its workspace features. Learn more at [https://pnpm.io/workspaces](https://pnpm.io/workspaces).

### 📂 Environment Variables

Create a `.env` file in `/apps/backend` with the following:

```
PORT=
FREE_TRIAL_LIMIT=
STYTCH_PROJECT_ID=
STYTCH_SECRET=
SECRET_KEY=
SALT=
TOKEN_KEY=
DB_URL=
OPENAI_API_KEY=
```

### ⚡ Install & Run

1. Clone and install:

```bash
git clone https://github.com/joseAcevesG/phishingMailAI.git
cd phishingMailAI
pnpm install
```

2. Start the backend:

```bash
pnpm run dev:backend
```

- or in the backend directory

```bash
pnpm run dev
```

## 📊 Dev Notes

- Supports hot-reload with nodemon
- Uses `.eml` format files for AI analysis
- Organized in `controllers/`, `routes/`, `models/`, `middlewares/`
- API endpoints scoped under `/api`

## ✂️ Lint & Format

Uses **Biome** for fast, reliable formatting and linting.

- Check, lint, format:

```bash
pnpm run check:backend
pnpm run lint:backend
pnpm run format:backend
```

- Quick fixes:

```bash
pnpm run check:backend
```

- Detailed check, lint, format:

```bash
pnpm run check:detailed:backend
pnpm run lint:detailed:backend
pnpm run format:detailed:backend
```

- on backend directory : backend not need to run check, lint, format

```bash
pnpm run check
pnpm run lint
pnpm run format
```

## ⚖️ Build & Start (Prod)

- Build backend:

```bash
pnpm run build:backend
```

- Start backend:

```bash
pnpm run start:backend
```

---

> This backend is tightly integrated into the monorepo and designed for scalability, security, and AI-powered phishing defense.
