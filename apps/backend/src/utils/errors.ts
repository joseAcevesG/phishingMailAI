import type z from "zod";

export class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BadRequest";
	}
}

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}

export class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Unauthorized";
	}
}

export class ForbiddenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Forbidden";
	}
}

export class InternalServerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InternalServerError";
	}
}

export class EnvError extends Error {
	static [Symbol.hasInstance](instance: unknown): boolean {
		return Boolean(
			instance &&
				typeof (instance as Error).name === "string" &&
				(instance as Error).name === "EnvError",
		);
	}
	constructor(errors: z.ZodError) {
		const errorMessages = errors.errors.map((error) => {
			const path = error.path.join(".");
			return `${path}: ${error.message}`;
		});

		super(`❌ Invalid environment variables:
${errorMessages.map((msg) => `  - ${msg}`).join("\n")}`);
		this.name = "EnvError";
		Error.captureStackTrace = () => {};
	}
}

export class EncryptError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "EncryptError";
	}
}
