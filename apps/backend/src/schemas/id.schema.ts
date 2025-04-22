import { z } from "zod";

export default z.object({
	id: z
		.string()
		.regex(/^[a-f\d]{24}$/i, { message: "Invalid ObjectId format" }),
});
