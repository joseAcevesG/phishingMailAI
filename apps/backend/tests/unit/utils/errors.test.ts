import { describe, expect, it } from "vitest";
import type { ZodError } from "zod";
import {
	BadRequestError,
	EncryptError,
	EnvError,
	ForbiddenError,
	InternalServerError,
	NotFoundError,
	UnauthorizedError,
} from "../../../src/utils/errors";

describe("Custom Error Classes", () => {
	it("BadRequestError should set correct name and message", () => {
		const err = new BadRequestError("bad");
		expect(err.name).toBe("BadRequest");
		expect(err.message).toBe("bad");
	});

	it("NotFoundError should set correct name and message", () => {
		const err = new NotFoundError("not found");
		expect(err.name).toBe("NotFoundError");
		expect(err.message).toBe("not found");
	});

	it("UnauthorizedError should set correct name and message", () => {
		const err = new UnauthorizedError("unauth");
		expect(err.name).toBe("Unauthorized");
		expect(err.message).toBe("unauth");
	});

	it("ForbiddenError should set correct name and message", () => {
		const err = new ForbiddenError("forbidden");
		expect(err.name).toBe("Forbidden");
		expect(err.message).toBe("forbidden");
	});

	it("InternalServerError should set correct name and message", () => {
		const err = new InternalServerError("fail");
		expect(err.name).toBe("InternalServerError");
		expect(err.message).toBe("fail");
	});

	it("EncryptError should set correct name and message", () => {
		const err = new EncryptError("encrypt fail");
		expect(err.name).toBe("EncryptError");
		expect(err.message).toBe("encrypt fail");
	});

	it("EnvError should format ZodError issues", () => {
		const fakeZodError = {
			errors: [
				{ path: ["FOO"], message: "Missing" },
				{ path: ["BAR"], message: "Invalid" },
			],
		} as unknown as ZodError<unknown>;
		const err = new EnvError(fakeZodError);
		expect(err.name).toBe("EnvError");
		expect(err.message).toContain("FOO: Missing");
		expect(err.message).toContain("BAR: Invalid");
		expect(err.message.startsWith("❌ Invalid environment variables:"));
	});

	it("EnvError[Symbol.hasInstance] works for EnvError", () => {
		const fakeZodError = { errors: [] } as unknown as ZodError<unknown>;
		const err = new EnvError(fakeZodError);
		expect(err instanceof EnvError).toBe(true);
		expect(EnvError[Symbol.hasInstance](err)).toBe(true);
		expect(EnvError[Symbol.hasInstance]({ name: "EnvError" })).toBe(true);
		expect(EnvError[Symbol.hasInstance]({ name: "Other" })).toBe(false);
	});
});
