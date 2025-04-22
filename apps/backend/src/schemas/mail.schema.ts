import z from "zod";

export default z.object({
	subject: z.string(),
	from: z.string(),
	to: z.string(),
	text: z.string(),
	html: z.string(),
});
