# 📱 Phishing Mail Detector - Backend Documentation

## Project Overview

This documentation covers the backend of a monorepo project where a React frontend coexists with a Node.js (Express) backend built using an MVC folder structure. The backend is responsible for user authentication via Stytch (using email magic links), data persistence with MongoDB, handling .eml file uploads, advanced email analysis with GPT-4o-mini, and various validations and error handling features.

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

3. Set up environment variables:

   - Create `.env` file in the backend directory:

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

- The backend runs on Express and uses MongoDB for data storage
- This application support hot-reloading for development
- Use `.eml` files for testing email analysis
- on visual studio code, you can install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension to test the API using the `api_test.http` file

## Try the API

The backend API is deployed at <https://phishingmailai.onrender.com>. You can test the endpoints (e.g., `/api/authenticate`, `/api/validate`, `/api/auth/status`, etc.) using your preferred API testing tool.
