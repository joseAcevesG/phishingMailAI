import type { User } from "../index";

// Augment Express.Request to include our custom properties
declare global {
	namespace Express {
		interface Request {
			user?: User;
			tokenRotated?: boolean;
			newRefreshToken?: string;
		}
	}
}
