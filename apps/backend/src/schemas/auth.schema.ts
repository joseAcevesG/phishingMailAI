import { z } from "zod";
import { AUTH_TYPE_VALUES } from "../utils/auth-types";

const PasswordSchema = z
	.string()
	// 1. Enforce minimum length ≥ 8
	.refine((pwd) => pwd.length >= 8, {
		message: "The password must have at least 8 characters.",
	})
	// 2. At least one lowercase letter
	.refine((pwd) => /[a-z]/.test(pwd), {
		message: "The password must contain at least one lowercase letter.",
	})
	// 3. At least one uppercase letter
	.refine((pwd) => /[A-Z]/.test(pwd), {
		message: "The password must contain at least one uppercase letter.",
	})
	// 4. At least one digit
	.refine((pwd) => /\d/.test(pwd), {
		message: "The password must contain at least one digit.",
	})
	// 5. At least one symbol
	.refine((pwd) => /[^A-Za-z0-9]/.test(pwd), {
		message: "The password must contain at least one symbol.",
	})
	.optional();

export default z.object({
	type: z.enum(AUTH_TYPE_VALUES as [string, ...string[]]),
	email: z.string().email("Invalid email format"),
	password: PasswordSchema,
});
