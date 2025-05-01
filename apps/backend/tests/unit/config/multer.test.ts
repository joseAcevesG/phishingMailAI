import type { Request } from "express";
import type { Multer } from "multer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface TestFile {
	originalname?: string;
	mimetype?: string;
}
interface StorageWithGetFilename {
	getFilename: (
		req: Request,
		file: TestFile,
		cb: (err: Error | null, filename?: string) => void,
	) => void;
}

vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		existsSync: vi.fn(() => true),
		mkdirSync: vi.fn(),
	};
});

import * as multerConfig from "../../../src/config/multer";

let upload: Multer;
let uploadsDir: string;

beforeEach(() => {
	vi.resetModules();
	upload = multerConfig.upload;
	uploadsDir = multerConfig.uploadsDir;
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("multer config", () => {
	it("should use the uploads directory", () => {
		expect(uploadsDir.endsWith("uploads")).toBe(true);
	});

	it("should generate a filename with timestamp and original name", async () => {
		const req = {} as Request;
		const file: TestFile = { originalname: "test.eml" };
		// Access storage internals for test purposes
		const storage = (upload as unknown as { storage: StorageWithGetFilename })
			.storage;
		const filename = await new Promise<string>((resolve, reject) => {
			(
				storage as {
					getFilename: (
						req: Request,
						file: TestFile,
						cb: (err: Error | null, filename?: string) => void,
					) => void;
				}
			).getFilename(req, file, (err, filename) => {
				if (err) return reject(err);
				if (filename === undefined)
					return reject(new Error("No filename generated"));
				resolve(filename);
			});
		});
		expect(filename).toMatch(/^[0-9]+-test\.eml$/);
	});

	it("should accept .eml files by mimetype", async () => {
		const req = {} as Request;
		const file: TestFile = {
			mimetype: "message/rfc822",
			originalname: "foo.eml",
		};
		const fileFilter = (
			upload as unknown as {
				fileFilter: (
					req: Request,
					file: TestFile,
					cb: (err: Error | null, accept?: boolean) => void,
				) => void;
			}
		).fileFilter;
		const accepted = await new Promise<boolean>((resolve, reject) => {
			fileFilter(req, file, (err, accept) => {
				if (err) return reject(err);
				resolve(Boolean(accept));
			});
		});
		expect(accepted).toBe(true);
	});

	it("should accept .eml files by extension", async () => {
		const req = {} as Request;
		const file: TestFile = {
			mimetype: "application/octet-stream",
			originalname: "foo.eml",
		};
		const fileFilter = (
			upload as unknown as {
				fileFilter: (
					req: Request,
					file: TestFile,
					cb: (err: Error | null, accept?: boolean) => void,
				) => void;
			}
		).fileFilter;
		const accepted = await new Promise<boolean>((resolve, reject) => {
			fileFilter(req, file, (err, accept) => {
				if (err) return reject(err);
				resolve(Boolean(accept));
			});
		});
		expect(accepted).toBe(true);
	});

	it("should reject non-.eml files", async () => {
		const req = {} as Request;
		const file: TestFile = { mimetype: "text/plain", originalname: "foo.txt" };
		const fileFilter = (
			upload as unknown as {
				fileFilter: (
					req: Request,
					file: TestFile,
					cb: (err: Error | null, accept?: boolean) => void,
				) => void;
			}
		).fileFilter;
		await expect(async () => {
			await new Promise((resolve, reject) => {
				fileFilter(req, file, (err, accept) => {
					if (err) return reject(err);
					resolve(accept);
				});
			});
		}).rejects.toThrow("Only .eml files are allowed");
	});
});
