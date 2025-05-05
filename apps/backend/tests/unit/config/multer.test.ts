// Unit tests for multer configuration
// Uses Vitest and mocks node:fs to test upload directory, filename, and file filtering logic
import type { Request } from "express";
import type { Multer } from "multer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as multerConfig from "../../../src/config/multer";

// Helper interfaces for test file and storage
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

// Mock node:fs to avoid actual filesystem operations and control behavior
vi.mock("node:fs", async () => {
	const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
	return {
		...actual,
		existsSync: vi.fn(() => true), // Always report uploads dir exists
		mkdirSync: vi.fn(), // Suppress directory creation
	};
});

let upload: Multer;
let uploadsDir: string;

// Reset modules and reload multer config before each test
beforeEach(() => {
	vi.resetModules();
	upload = multerConfig.upload;
	uploadsDir = multerConfig.uploadsDir;
});

afterEach(() => {
	vi.restoreAllMocks();
});

// Test suite for multer config
// Covers uploads directory, filename generation, and file filter logic

describe("multer config", () => {
	// Test: uploadsDir should end with 'uploads'
	it("should use the uploads directory", () => {
		expect(uploadsDir.endsWith("uploads")).toBe(true);
	});

	// Test: filename generation should include timestamp and original name
	it("should generate a filename with timestamp and original name", async () => {
		const req = {} as Request;
		const file: TestFile = { originalname: "test.eml" };
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

	// Test: Accept .eml files by mimetype
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

	// Test: Accept .eml files by extension
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

	// Test: Reject non-.eml files
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
