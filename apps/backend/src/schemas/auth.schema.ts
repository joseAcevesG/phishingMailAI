import { z } from "zod";

export default z.object({
	type: z.enum(["magic_link", "password_login"]),
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required").optional(),
});
