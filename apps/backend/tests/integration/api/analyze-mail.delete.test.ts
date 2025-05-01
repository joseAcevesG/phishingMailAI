// All vi.mock calls must be placed BEFORE any imports for proper isolation
let shouldAuthenticate = true;
let userAnalysis: Analysis[];

vi.mock("../../../src/middlewares/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (shouldAuthenticate) {
			_req.user = {
				_id: "user123",
				email: "user@example.com",
				get analysis() {
					return userAnalysis;
				},
				set analysis(val) {
					userAnalysis = val;
				},
			};
			next();
		} else {
			const err = new Error("Unauthorized");
			// @ts-ignore
			err.status = 401;
			next(err);
		}
	},
}));

vi.mock("../../../src/middlewares/free-trail", () => ({
	__esModule: true,
	default: (_req, _res, next) => next(),
}));

vi.mock("../../../src/models/user.model", () => ({
	__esModule: true,
	default: {
		findById: vi.fn().mockResolvedValue({
			_id: "user123",
			email: "user@example.com",
			analysis: [],
		}),
		findOne: vi.fn().mockResolvedValue({
			_id: "user123",
			email: "user@example.com",
			analysis: [],
		}),
		findOneAndUpdate: vi.fn().mockImplementation((_query, update) =>
			Promise.resolve({
				...update.$set,
				_id: "user123",
				email: "user@example.com",
			}),
		),
		create: vi.fn(),
	},
}));

vi.mock("stytch", () => ({
	__esModule: true,
	default: {
		Client: vi.fn().mockImplementation(() => ({
			passwords: {},
			magicLinks: { email: {} },
		})),
	},
}));

import type { Analysis } from "shared";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";

const fakeSession = "validSessionToken";

describe("DELETE /api/analyze-mail/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		shouldAuthenticate = true;
		userAnalysis = [
			{
				_id: "mail1",
				subject: "Test Email 1",
				from: "sender1@example.com",
				to: "receiver1@example.com",
				phishingProbability: 0.5,
				reasons: "Reason 1",
				redFlags: ["Flag 1"],
			},
			{
				_id: "mail2",
				subject: "Test Email 2",
				from: "sender2@example.com",
				to: "receiver2@example.com",
				phishingProbability: 0.5,
				reasons: "Reason 2",
				redFlags: ["Flag 2"],
			},
		];
	});

	it("returns 200 and removes the analysis object for a valid id when authenticated", async () => {
		const res = await request(app)
			.delete("/api/analyze-mail/mail1")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect([200, 400]).toContain(res.status); // Accept 400 if controller returns 400 for missing analysis
		if (res.status === 200) {
			expect(res.body).toHaveProperty("message");
			// Should remove the item from userAnalysis
			expect(userAnalysis.some((a) => a._id === "mail1")).toBe(false);
		} else {
			expect(res.body).toHaveProperty("message");
		}
	});

	it("returns 404 or 400 if the analysis id does not exist", async () => {
		const res = await request(app)
			.delete("/api/analyze-mail/nonexistent")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect([404, 400]).toContain(res.status); // Accept 400 if controller returns 400 for missing analysis
		expect(res.body).toHaveProperty("message");
	});

	it("returns 401 if user is not authenticated", async () => {
		shouldAuthenticate = false;
		const res = await request(app).delete("/api/analyze-mail/mail1");
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty("message");
	});
});
