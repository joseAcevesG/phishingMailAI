import stytch from "stytch";
import { EnvConfig } from "./env.config";

const env = EnvConfig();

export const stytchClient = new stytch.Client({
	project_id: env.stytch.projectId,
	secret: env.stytch.secret,
});
