import type z from "zod";

/**
 * An error thrown when a request is invalid or cannot be processed.
 * The `message` property of the error will contain a human-readable description
 * of why the request was invalid.
 */
export class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BadRequest";
	}
}

/**
 * An error indicating that a requested resource could not be found.
 * The `message` property provides details about the missing resource.
 */
export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NotFoundError";
	}
}

/**
 * An error indicating that the request was not authenticated or authorized.
 * The `message` property provides details about the authentication or authorization failure.
 */
export class UnauthorizedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Unauthorized";
	}
}

/**
 * An error indicating that the request was not authorized.
 * The `message` property provides details about the authorization failure.
 */
export class ForbiddenError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Forbidden";
	}
}

/**
 * An error indicating that an internal server error occurred.
 * The `message` property provides details about the error.
 */
export class InternalServerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InternalServerError";
	}
}

/**
 * An error indicating that an environment variable error occurred.
 * The `message` property provides details about the error.
 */
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

/**
 * An error indicating that an encryption error occurred.
 * The `message` property provides details about the error.
 */
export class EncryptError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "EncryptError";
	}
}
