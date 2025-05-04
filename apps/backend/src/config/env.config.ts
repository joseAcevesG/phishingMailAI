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

/**
 * EnvConfig returns an object with the following properties:
 *
 * - environment: the NODE_ENV from the environment variables
 * - port: the port number to listen on, parsed from the PORT environment variable
 * - freeTrialLimit: the maximum number of free trial days, parsed from the FREE_TRIAL_LIMIT environment variable
 * - stytch: an object with the following properties:
 *   - projectId: the Stytch project ID from the STYTCH_PROJECT_ID environment variable
 *   - secret: the Stytch secret from the STYTCH_SECRET environment variable
 * - secretKey: the secret key for encrypting and decrypting data from the SECRET_KEY environment variable
 * - salt: the salt value for encrypting and decrypting data from the SALT environment variable
 * - tokenKey: the secret key for signing and verifying JWTs from the TOKEN_KEY environment variable
 * - dbUrl: the MongoDB connection URL from the DB_URL environment variable
 * - openai: an object with the following property:
 *   - apiKey: the OpenAI API key from the OPENAI_API_KEY environment variable
 *
 * @returns {object} The config object with the properties above
 */
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
