# 📱 Phishing Mail Detector - Frontend Documentation

## 🔍 Overview

This frontend is a modern, responsive React single-page application (SPA) written in TypeScript and styled with vanilla CSS. It communicates securely with the backend via HTTP-only cookies and integrates Stytch for password or passwordless authentication using magic links.

**Key Features:**

- Authentication via Stytch password or magic links
- `.eml` file upload with phishing detection results via GPT-4o
- Reusable components (`UploadForm`, `ResultView`, etc.)
- Protected routes with React Router
- Timed resend logic and clean error handling
- Global styling via `index.css`

## 🚀 Tech Stack

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Auth:** Stytch
- **Styles:** Vanilla CSS
- **Tooling:** pnpm, Biome

## ⚖️ Try the App

- Deployed at: [https://phishingmailai.onrender.com](https://phishingmailai.onrender.com)
- Key routes:

  - `/` – Upload page
  - `/auth` – Login and magic link flow
  - `/result` – Phishing analysis result

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- pnpm
- Backend service running (see backend README)

### Why pnpm?

`pnpm` offers fast installs, workspace support, and disk efficiency. Great for managing monorepo projects.

> Learn more: [https://pnpm.io/workspaces](https://pnpm.io/workspaces)

### 📂 Environment Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/joseAcevesG/phishingMailAI.git
cd phishingMailAI
pnpm install
```

2. Confirm backend is running. If it's using a custom port, edit `vite.config.ts`:

```ts
target: "http://localhost:PORT",
```

## ⚡ Run Dev Server

```bash
pnpm run dev:frontend
```

- on frontend directory

```bash
pnpm run dev
```

Supports hot reload out of the box via Vite.

## 📊 Dev Notes

- State management is handled locally via context (`AuthContext`)
- All core types are centralized under `types/`
- Pages and routes are guarded via context-aware logic
- File upload handled securely and sent to backend for analysis

## ✂️ Lint & Format

Uses **Biome** for fast, reliable formatting and linting.

- Check, lint, format:

```bash
pnpm run check:frontend
pnpm run lint:frontend
pnpm run format:frontend
```

- Quick fixes:

```bash
pnpm run check:frontend
```

- Detailed check, lint, format:

```bash
pnpm run check:detailed:frontend
pnpm run lint:detailed:frontend
pnpm run format:detailed:frontend
```

- on frontend directory : frontend not need to run check, lint, format

```bash
pnpm run check
pnpm run lint
pnpm run format
```

## ⚖️ Build (Prod)

```bash
pnpm run build:frontend
```

## 🧪 Test

```bash
pnpm run test:frontend
pnpm run test:coverage:frontend
pnpm run test:e2e
```

- on frontend directory : frontend not need to run test

```bash
pnpm run test
pnpm run test:coverage
pnpm run test:e2e
```

---

> The frontend is minimal by design and structured for scalability, accessibility, and security.
