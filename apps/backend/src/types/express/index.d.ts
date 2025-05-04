import type { User } from "../index";

declare global {
	namespace Express {
		interface Request {
			user?: User;
			tokenRotated?: boolean;
			newRefreshToken?: string;
		}
	}
}
