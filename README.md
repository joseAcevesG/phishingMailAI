# 📱 Phishing Mail Detector - Monorepo Documentation

## Project Overview

This monorepo hosts a full-stack application comprising a React single-page application (SPA) for the frontend and a Node.js (Express) backend built using an MVC folder structure.

The app tackles a critical challenge in today’s digital landscape: phishing detection. With phishing attacks growing increasingly sophisticated—often leveraging AI techniques to craft deceptive messages—it has become harder to distinguish genuine communication from malicious attempts. Our solution integrates robust user authentication (via Stytch magic links), secure file uploads (accepting only `.eml` files), and advanced phishing analysis powered by GPT-4o to assess the likelihood of an email being a phishing attempt. By combining secure backend processes with a clean, minimalistic frontend, this application offers a comprehensive and user-friendly tool to help mitigate phishing risks.

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- MongoDB (local or cloud instance)
- Stytch account for authentication
- OpenAI API key to use the GPT-4o model

### Why pnpm?

pnpm is a fast, disk space efficient, and secure package manager that provides a more efficient way to manage dependencies in a monorepo. It uses a single global store for all dependencies, which reduces the amount of disk space used and speeds up the installation process. pnpm also provides features like deduplication and zero-installs, which can improve the performance of your development workflow.

Also, this project uses pnpm workspace, which allows you to manage dependencies across multiple packages in a monorepo. for more information, check the [pnpm workspace documentation](https://pnpm.io/workspaces).

### Environment Setup

1. Clone the repository:

   ```bash
   https://github.com/joseAcevesG/phishingMailAI.git
   cd phishingMailAI
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   - Create `.env` files in `/apps/backend` :

   ```
   PORT= (number of the port to use, this is optional, by default 3000)
   FREE_TRIAL_LIMIT= (number of free trials a user can have, this is optional, by default 3)
   STYTCH_PROJECT_ID= (string of the project id on Stytch)
   STYTCH_SECRET= (string of the secret key on Stytch)
   SECRET_KEY= (string of the secret key to encrypt data)
   SALT= (string of the salt to encrypt data)
   TOKEN_KEY= (string of the token key for JWT)
   DB_URL= (string of the MongoDB database url)
   OPENAI_API_KEY= (string of the OpenAI API key)
   ```

### Running the Application

- Start both applications:

  ```bash
  pnpm run dev
  ```

- Start backend:

  ```bash
  pnpm run dev:backend
  ```

- Start frontend:

  ```bash
  pnpm run dev:frontend
  ```

### Linter, formatter, and type checker

This project uses biome for linting and formatting.

- To **fix** fixable errors and **show details** of not fixable errors you can use:

  - Check (format and lint):

    ```bash
    pnpm run check
    ```

  - Format:

    ```bash
    pnpm run format
    ```

  - Lint:

    ```bash
    pnpm run lint
    ```

- To **show details** of errors you can use:

  - Check (format and lint):

    ```bash
    pnpm run check:detailed
    ```

  - Lint:

    ```bash
    pnpm run lint:detailed
    ```

  - Format:

    ```bash
    pnpm run format:detailed
    ```

- To run the biome on the front end or the back end add `:backend` or `:frontend` to the command:

  ```bash
  pnpm run check:detailed:backend
  pnpm run check:detailed:frontend
  ```

### Development Notes

- The backend runs on Express and uses MongoDB for data storage
- Frontend is built with React + Vite
- Both applications support hot-reloading for development
- Use `.eml` files for testing email analysis

## Try the App

The app is deployed at <https://phishingmailai.onrender.com>, and this video shows it off <https://res.cloudinary.com/dbdvgci4w/video/upload/v1743474875/FishingMail_eqesvg.mov>
