import crypto from "node:crypto";
import { EnvConfig } from "../config/env.config";

export default (password: string): string => {
	const valid_password = password ?? "";
	const hash = crypto.scryptSync(valid_password, EnvConfig().secretKey, 24);
	return hash.toString("hex");
};
