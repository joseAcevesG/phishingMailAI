import dotenv from "dotenv";
import { z } from "zod";
import envSchema from "../schemas/env.schema";
import { EnvError } from "../utils/errors";

dotenv.config();

let env: z.infer<typeof envSchema>;

try {
	env = envSchema.parse(process.env);
} catch (error) {
	if (error instanceof z.ZodError) {
		throw new EnvError(error);
	}
	throw error;
}

export const EnvConfig = () => {
	const config = {
		environment: env.NODE_ENV,
		port: Number.parseInt(env.PORT, 10),
		freeTrialLimit: Number.parseInt(env.FREE_TRIAL_LIMIT, 10),
		stytch: {
			projectId: env.STYTCH_PROJECT_ID,
			secret: env.STYTCH_SECRET,
		},
		secretKey: env.SECRET_KEY,
		salt: env.SALT,
		tokenKey: env.TOKEN_KEY,
		dbUrl: env.DB_URL,
		openai: {
			apiKey: env.OPENAI_API_KEY,
		},
	} as const;

	return config;
};
