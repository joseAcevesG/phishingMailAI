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

2. **Important:** Install dependencies in the root directory:

   ```bash
   pnpm install
   ```

3. Enter the frontend directory:

   ```bash
   cd apps/frontend
   ```

4. Make sure that the backend is running

   If you have the backend running in another port, you need to change the target in `vite.config.ts`:

   ```ts
   target: "http://localhost:PORT",
   ```

- Optional: mock backend responses:
  if you only want to work on the frontend, you can mock the backend responses on the every fetch call.

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

- **/login:** A login page with a button that triggers the backend magic link flow.

- **/:** If the user is authenticated, the Home page where an authenticated user can upload a `.eml` file. After submission, the file is sent to `/api/analyze-mail/validate` and the analysis result is displayed. If the user is not authenticated, show a Landing page.

- **/authenticate:** A page that processes a token parameter from a magic link and verifies the session with the backend.
- **/set-api-key:** A page that allows users to set their OpenAI API key.

## Initial Prompt and Cursor Response

**Initial Prompt to Cursor:**

> Generate the frontend for a React single-page application (SPA) using vanilla CSS (no frameworks like Tailwind).
>
> The project structure is already set up in a monorepo with React (frontend) and Node.js (backend).
>
> User authentication is handled entirely on the backend using Stytch, so the frontend will only consume authentication state (e.g. from a cookie or context provided by the backend).
>
> The SPA should include the following routes using React Router:
>
> 1. `/login`: A simple login page with a button to trigger authentication (e.g., redirects or opens magic link flow handled by backend). If already authenticated, redirect to `/`.
> 2. `/`: The Home page where a logged-in user can upload a `.eml` file. Show a clean file upload UI (accept `.eml` only) and a “Submit” button. When submitted, send the file to the backend at `/api/analyze-email` and redirect to `/result`.
> 3. `/result`: Displays the result of the phishing analysis (consume from backend, display as “Safe”, “Suspicious”, or “Phishing” with a short summary).
>
> ✅ The app should:
>
> - Use React Router for navigation
> - Protect the `/` and `/result` routes (require authentication)
> - Use vanilla CSS, clean and minimal
> - Include a simple Header component showing “Logged in as [email]” and a “Logout” button on authenticated routes
>
> Assume that auth state (e.g. user session) is provided via HTTP-only cookies or backend session.

**Cursor's Response:**

Built React SPA with protected routes and clean UI. Implemented login flow, file upload for `.eml` files, and result display. The Header shows user information and a logout button. All styling was implemented using vanilla CSS.

## Followup Prompts Regarding Features, and Cursor Responses

1. **Prompt:**  
   "create a types folder and move all the types or interfaces to there"  
   **Response:**  
   Refactored codebase to centralize type definitions. Created a `types` folder and moved all interfaces and types for better organization and reusability.

2. **Prompt:**  
   "make the login work, the route on the back that is going to use is `/api/auth/login` this is going to send a magic link to the user, disable the button for 15 sec, while is disabled put on the button 'you can resend a magic link in: n seconds' after that change the button to resend, the auth is provided via HTTP-only cookies"  
   **Response:**  
   Implemented login functionality with magic link flow. Added a countdown timer on the resend button, email validation, and proper error handling. Authentication is managed via HTTP-only cookies.

3. **Prompt:**  
   "create a page `/authenticate` that is going to receive a param, extract the token param and send it to `/api/authenticate?token=[token value]` and when the response of the back is good redirect to home"  
   **Response:**  
   Created an `Authenticate` component to handle magic link verification. Implemented token extraction from the URL and an authentication flow that redirects to the Home page upon success.

4. **Prompt:**  
   "change the app to stop using demo data and start using the api, the auth is provided via HTTP-only cookies"  
   **Response:**  
   Refactored the app to use real API endpoints instead of demo data. Enhanced the authentication flow to properly manage user sessions via HTTP-only cookies.

5. **Prompt:**  
   "make the home component work, use @api_test.http to see the endpoints you need to use"  
   **Response:**  
   Integrated the Home component with backend API endpoints. Implemented the `.eml` file upload functionality and added robust error handling for email analysis.

6. **Prompt:**  
   "change to home to components, one is the component to upload the `.eml` and the other is the component of the result, with this change the route `/result` is not necessary"  
   **Response:**  
   Split the Home page into two components: `UploadForm` and `ResultView`. Removed the separate result route for a smoother user experience and improved state management across components.

7. **Prompt:**  
   "move the auth logic (fetching status, updating state, handling logout/authenticate) into a custom hook"  
   **Response:**  
   Created a `useAuth` custom hook to encapsulate authentication logic. This hook now manages auth state, login/logout flows, and status checks, leading to better code organization and reusability.

8. **Prompt:**  
   "on the handleAnalyze if the response is a 403 I want that the error say that 'you are out of free tries' and a button that says 'set openAI key' or something like that, then take the user to another page with a form to enter his API key of OpenAI. On submit, the endpoint that is needed to use is `/api/changeTrial { 'api_key': '{{api_key}}' }` using that body, create also this page"  
   **Response:**  
   Added an `ApiKeyForm` component with form validation and API integration. Enhanced error handling for free trial expiration and provided seamless navigation to the API key setup page.

9. **Prompt:**  
   "on the frontend catch the 400 and show the same error as when the user doesn't have more free tries, changing the message to that it was an error with their OpenAI key"  
   **Response:**  
   Enhanced error handling to display a consistent UI message for both free trial exhaustion and invalid OpenAI API key errors. Improved error messages and user guidance accordingly.

10. **Prompt:**  
    "change all the css files on @apps/frontend to use css module"  
    **Response:**  
    All CSS files have been converted to use CSS modules with .module.css extension for better CSS scoping and maintainability.

## Followup Prompts Regarding User Interface, and Cursor Responses

1. **Prompt:**  
   "check all the css files and the ones that are global styles add them to the index.css, also check the components folder and the pages folder and add the styles to the index.css"  
   **Response:**  
   Standardized the CSS structure by consolidating global styles into `index.css`. This improved consistency in theme variables and layout properties across all components.

2. **Prompt:**  
   "@UploadForm.tsx do something similar for the error handle on for the login, I want the login to match the UploadForm"  
   **Response:**  
   Enhanced the login component by applying consistent error handling patterns similar to those used in the `UploadForm`. This improved form submission and overall user feedback.

3. **Prompt:**  
   "@fishingMailAI.ico change to use this as the fav ico"  
   **Response:**  
   Updated the favicon configuration to use the custom `fishingMailAI.ico` file, replacing the default Vite SVG favicon.

4. **Prompt:**  
   "add a button to go to `/set-api-key` only when is login"  
   **Response:**  
   Added a conditional button in the header for authenticated users that navigates to the API key setup page. This improves navigation and route protection.

5. **Prompt:**  
   "add another button to go to home"  
   **Response:**  
   Added a Home navigation button in the header with consistent styling, enhancing overall user navigation throughout the app.

6. **Prompt:**  
   "crate a landing page for this project, i want that when you enter to the domain and you aren't login redirect to there, but if you try to go to a ProtectedRoute go to logIn"  
   **Response:**  
   Landing page implemented with authentication redirects using useAuth hook. Unauthenticated users see landing page, authenticated users are redirected to home, and protected routes redirect to login.

## Summary

**Final App Description:**

The final frontend is a robust React SPA built with vanilla CSS, featuring a clean and minimal UI. It provides protected routes for authentication, a user-friendly login flow using magic links, and components for file upload and phishing analysis result display. The app also includes centralized type definitions, consolidated global styles, and improved error handling mechanisms. Key elements such as dynamic navigation buttons and favicon customization further enhance the user experience.

**What I liked about Cursor:**

- It accelerated frontend development by generating core components and routing logic.
- The resulting code is modular and adheres to best practices, ensuring easier maintenance.
- Cursor provided robust solutions for handling authentication flows, UI consistency, and error handling, leading to a smooth and intuitive user interface.

**Challenges / Issues:**

- Integrating real API endpoints required careful coordination of authentication state.
- Balancing feature functionality with consistent UI feedback needed additional fine-tuning.
- Consolidating CSS without affecting component-level design required extra attention.

Overall, this frontend project significantly improved the user experience by combining functional components with a clean, organized interface. Cursor proved to be an invaluable partner in building a robust and maintainable React SPA.
