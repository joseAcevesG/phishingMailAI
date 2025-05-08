# 📱 Phishing Mail Detector - Monorepo Documentation

## 🔍 Overview

Phishing attacks are rapidly evolving, using AI-generated messages to deceive even the most vigilant users. This full-stack application offers a robust and user-friendly solution for detecting phishing emails. Built with a React single-page application (SPA) and an Express (Node.js) backend structured using MVC principles, it provides secure authentication, safe file handling, and AI-powered analysis using GPT-4o.

**Key Features:**

- Magic link authentication via Stytch
- Secure `.eml` file uploads
- GPT-4o powered phishing detection
- Modular monorepo structure using `pnpm` workspaces

## ⚖️ Try It Out

- **Frontend:** [https://phishingmailai.onrender.com](https://phishingmailai.onrender.com)
- **API Endpoint:** [https://phishingmailai.onrender.com/api](https://phishingmailai.onrender.com/api)
- **API Docs:** [https://phishingmailai.onrender.com/api/docs](https://phishingmailai.onrender.com/api/docs)

## 🚀 Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js (Express), MongoDB
- **Authentication:** Stytch Magic Links and password login
- **AI Analysis:** OpenAI GPT-4o
- **Package Manager:** pnpm

## ⚙️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- MongoDB (local or Atlas)
- Stytch account ([https://stytch.com](https://stytch.com))
- OpenAI API key ([https://openai.com](https://openai.com))

### Why pnpm?

`pnpm` ensures fast, space-efficient dependency management. Its workspace feature is ideal for monorepos, enabling better deduplication and project isolation.

> Learn more: [https://pnpm.io/workspaces](https://pnpm.io/workspaces)

### 📂 Environment Variables

Create a `.env` file in `/apps/backend` with the following:

```
PORT=                 #default 3000
FREE_TRIAL_LIMIT=     #default 3
STYTCH_PROJECT_ID=    #required
STYTCH_SECRET=        #required
SECRET_KEY=           #required
SALT=                 #required
TOKEN_KEY=            #required
DB_URL=               #required
OPENAI_API_KEY=       #required
```

- Port: The port number to use for the server. Default is 3000.
- Free Trial Limit: The number of free trial requests allowed before providing a openAI API key. Default is 3.
- Stytch Project ID: The Stytch project ID for authentication.
- Stytch Secret: The Stytch secret for authentication.
- Secret Key: The secret key used for encrypting and decrypting.
- Salt: The salt used for encrypting and decrypting.
- Token Key: The token key used for encrypting and decrypting jwt tokens.
- DB URL: The URL of the MongoDB database.
- OpenAI API Key: The OpenAI API key for GPT-4o.

### ⚡ Installation

```bash
git clone https://github.com/joseAcevesG/phishingMailAI.git
cd phishingMailAI
pnpm install
```

## 🚪 Scripts

### Start Applications

```bash
pnpm run dev             # Starts both frontend and backend
pnpm run dev:backend     # Starts backend only
pnpm run dev:frontend    # Starts frontend only
```

### 🔧 Build and Start (Prod)

- build apps

```bash
pnpm run build              # Builds both apps
pnpm run build:backend      # Backend only
pnpm run build:frontend     # Frontend only
```

- start app

```bash
pnpm run start              # Starts backend providing the builded frontend
```

### ✂️ Lint & Format

Uses **Biome** for fast, modern formatting and linting:

- All-in-one check:

```bash
pnpm run check
pnpm run check:detailed   # explain issues with out fix them
```

- Format only:

```bash
pnpm run format
pnpm run format:detailed # explain issues with out fix them
```

- Lint only:

```bash
pnpm run lint
pnpm run lint:detailed   # explain issues with out fix them
```

- Scope to frontend/backend:

```bash
pnpm run check:detailed:backend
pnpm run check:detailed:frontend
```

### 🧪 Test

```bash
pnpm run test # all-in-one test
pnpm run test:backend # backend only
pnpm run test:frontend # frontend only
pnpm run test:coverage # all-in-one coverage
pnpm run test:coverage:backend # backend coverage
pnpm run test:coverage:frontend # frontend coverage
pnpm run test:e2e # end-to-end tests
```

## 📊 Architecture Notes

- **Backend:** Express with MVC, serves static frontend build in production
- **Frontend:** React (Vite) SPA, minimal UI, secure upload form
- **Security:** Stytch handles auth, backend validates uploads, all tokens encrypted with `SECRET_KEY` and `SALT`
- **AI:** GPT-4o used to score likelihood of phishing from `.eml` contents

- **test mail:** you can find phishing mail to test the app on the next link: [phishing mail](https://github.com/rf-peixoto/phishing_pot/tree/main/email)
