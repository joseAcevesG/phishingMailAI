# 📱 Phishing Mail Detector - Frontend Documentation

## Project Overview

This frontend is a modern React single-page application (SPA) built with TypeScript and vanilla CSS for a clean, minimal design. The app features a custom authentication system using Stytch's magic links, managed through HTTP-only cookies for security. Core functionality is organized into reusable components including an `UploadForm` for .eml file submissions and a `ResultView` for displaying phishing analysis results. The codebase follows best practices with centralized type definitions, a custom `useAuth` hook for authentication state management, and consolidated global styles in `index.css`. The application provides a seamless user experience with features like timed magic link resending, proper error handling, and protected routes managed through React Router.

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

2. **Important:** Install dependencies:

   ```bash
   pnpm install
   ```

3. Make sure that the backend is running

   If you have the backend running in another port, you need to change the target in `vite.config.ts`:

   ```ts
   target: "http://localhost:PORT",
   ```

### Running the Application

- Start the application:

  ```bash
  pnpm run dev
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

### Development Notes

- Frontend is built with React + Vite
- This application support hot-reloading for development
- Use `.eml` files for testing email analysis

## Try the App

The React SPA is deployed at <https://phishingmailai.onrender.com> and includes the following routes:
