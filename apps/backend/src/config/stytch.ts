import stytch from "stytch";
import { EnvConfig } from "./env.config";

const env = EnvConfig();

/**
 * stytchClient is a client instance of the Stytch API.
 * It is used to interact with the Stytch API.
 */
export const stytchClient = new stytch.Client({
	project_id: env.stytch.projectId,
	secret: env.stytch.secret,
});
