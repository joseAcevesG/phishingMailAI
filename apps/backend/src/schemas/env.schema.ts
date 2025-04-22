import { z } from "zod";

export default z.object({
	NODE_ENV: z
		.enum(["development", "production", "local", "test"])
		.default("development"),
	PORT: z.string().default("3000"),
	FREE_TRIAL_LIMIT: z.string().default("3"),
	STYTCH_PROJECT_ID: z.string().min(1, "STYTCH_PROJECT_ID is required"),
	STYTCH_SECRET: z.string().min(1, "STYTCH_SECRET is required"),
	SECRET_KEY: z.string().min(1, "SECRET_KEY is required"),
	SALT: z.string().min(1, "SALT is required"),
	TOKEN_KEY: z.string().min(1, "TOKEN_KEY is required"),
	DB_URL: z.string().min(1, "DB_URL is required"),
	OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
});
