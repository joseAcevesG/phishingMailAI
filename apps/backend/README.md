# 📱 Phishing Mail Detector - Backend Documentation

## Project Overview

This documentation covers the backend of a monorepo project where a React frontend coexists with a Node.js (Express) backend built using an MVC folder structure. The backend is responsible for user authentication via Stytch (using email magic links), data persistence with MongoDB, handling .eml file uploads, advanced email analysis with GPT-4o-mini, and various validations and error handling features.

## Try the API

The backend API is deployed at <https://phishingmailai.onrender.com>. You can test the endpoints (e.g., `/api/authenticate`, `/api/validate`, `/api/auth/status`, etc.) using your preferred API testing tool.

## Initial Prompt and Cursor Response

**Initial Prompt to Cursor:**

> I have a monorepo project using React for the frontend and Node.js (Express) for the backend. The project is already set up, so do not modify anything that already exists.
>
> I want to implement user authentication using Stytch.
>
> Use a Model-View-Controller (MVC) folder structure in the backend.
>
> The backend should expose routes under the `/api` base path. Create the necessary backend route to handle authentication using Stytch, including:
>
> - Initializing the Stytch client
> - Accepting a POST request to `/api/authenticate`
> - Reading a `token` from the request body
> - Verifying the token using the Stytch SDK
> - Returning a user session or error response
>
> Assume I'm using email magic links for authentication.

**Cursor's Response:**

Implemented Stytch authentication with magic links. Added `/api/authenticate` endpoint and middleware for token verification. MVC structure maintained.

**Was it what you expected?**

Yes, the generated solution provided a solid foundation for integrating Stytch authentication into the existing backend while respecting the MVC structure and preserving existing code.

## Followup Prompts Regarding Features, and Cursor Responses

Here are **eight feature-related prompts** I gave to Cursor and what happened:

1. **Prompt:**  
   "create a model using mongoDB

   import { Schema, model } from \"mongoose\";
   import Roles from \"../types/roles\";

   const schema = new Schema({
   name: {
   type: String,
   required: true,
   },
   username: {
   type: String,
   required: true,
   unique: true,
   },
   password: {
   type: String,
   },
   email: {
   type: String,
   required: true,
   unique: true,
   },
   role: {
   type: String,
   required: true,
   enum: Object.values(Roles),
   default: \"user\",
   },
   image: {
   type: String,
   },
   });

   export default model(\"User\", schema);

   use this as an example, the fields I want are: mail, api_key, freeTrial, usageFreeTrial"

   **Response:**  
   Created a User model with fields for email, an encrypted API key, a boolean for freeTrial, and a counter for usageFreeTrial. The schema works correctly with MongoDB.

2. **Prompt:**  
   "create the file to config the connection to mongoose add this to the .env  
   DB_IRL = "

   **Response:**  
   Added MongoDB connection configuration with `DB_URL` in the .env file. Connection established successfully.

3. **Prompt:**  
   "add a multer to receive .eml files, use the route /validate"

   **Response:**  
   Configured Multer for .eml file uploads at the `/validate` endpoint. File storage and validation are working properly.

4. **Prompt:**  
   "What I want is to create a function with express that receives a .eml file, then sends that file to gpt4o-mini and analyzes if it is a phishing mail or not.

   Add settings for the OpenAI API to set up a return format; I want a JSON with the probability of being phishing and a description explaining that score.

   Also add a system prompt."

   **Response:**  
   Implemented email analysis with GPT. The endpoint returns a JSON containing the phishing probability along with a detailed explanation. A system prompt guides the response to ensure accurate assessments.

5. **Prompt:**  
   "create a method to change the freeTrial to false and add an api_key that is in the body of the request, encrypt the api_key using the encrypt-strings.ts, and save the changes using the user model"

   **Response:**  
   Added API key management with encryption. The freeTrial status updates correctly when an API key is provided, and the changes are persisted in the database.

6. **Prompt:**  
   "add a validation to check if the emailContent is not empty"

   **Response:**  
   Added email content validation. Empty emails are now properly rejected with an appropriate error message.

7. **Prompt:**  
   "create the /api/auth/status endpoint that sends {authenticated: bool, email: email | undefined}. If not authenticated, send a 401."

   **Response:**  
   Added a status endpoint to verify authentication state. It returns a JSON object with the authentication status and email, and it handles invalid or missing tokens with a 401 response.

8. **Prompt:**  
   "add a validation that if OpenAI answers incorrectly, send a 400 with the message that the API they provided is wrong"

   **Response:**  
   Added OpenAI API authentication error handling. The endpoint now returns a 400 status with a clear error message when an invalid API key is detected, thereby improving error handling across the backend.

## Summary

**Final App Description:**

The backend service is a robust Node.js (Express) API built within an MVC structure, responsible for user authentication via Stytch, data persistence with MongoDB, and file handling for .eml files. It also integrates advanced email analysis using GPT to detect phishing attempts, along with comprehensive validations and error handling to ensure reliable operation.

**What I liked about Cursor:**

- It accelerated backend development by generating key routes, models, and integrations.
- The code produced adhered to the MVC structure and integrated well with existing project setups.
- Cursor provided solutions for complex tasks such as encryption of API keys, file handling with Multer, and external API integrations, significantly reducing development time.

**Challenges / Issues:**

- Some integration points, particularly with external APIs and encryption, required manual adjustments.
- Error handling needed additional fine-tuning to cover all edge cases.
- Ensuring the generated code adhered to existing project conventions was occasionally challenging.

Overall, this backend project not only expanded the API’s functionality but also boosted my confidence in building and deploying a robust service. Cursor proved to be an invaluable coding partner in tackling diverse backend challenges.
