import type { User } from "../index";

// Augments the Express Request type with additional properties.
declare global {
	namespace Express {
		interface Request {
			user?: User;
			tokenRotated?: boolean;
			newRefreshToken?: string;
		}
	}
}
