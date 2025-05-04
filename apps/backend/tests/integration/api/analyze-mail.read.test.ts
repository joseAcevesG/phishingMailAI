import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../../src/index";

let shouldAuthenticate = true;

vi.mock("../../../src/middlewares/auth", () => ({
	__esModule: true,
	default: (_req, _res, next) => {
		if (shouldAuthenticate) {
			_req.user = {
				_id: "user123",
				email: "user@example.com",
				analysis: [
					{
						_id: "mail1",
						subject: "Test Email 1",
						from: "sender1@example.com",
						to: "receiver1@example.com",
					},
					{
						_id: "mail2",
						subject: "Test Email 2",
						from: "sender2@example.com",
						to: "receiver2@example.com",
					},
				],
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

const fakeSession = "validSessionToken";

describe("GET /api/analyze-mail", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		shouldAuthenticate = true;
	});

	it("returns 200 and the user's analysis array when authenticated", async () => {
		const res = await request(app)
			.get("/api/analyze-mail")
			.set("Cookie", [`session_token=${fakeSession}`]);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(2);
		expect(res.body[0]).toMatchObject({
			_id: "mail1",
			subject: "Test Email 1",
			from: "sender1@example.com",
			to: "receiver1@example.com",
		});
		expect(res.body[1]).toMatchObject({
			_id: "mail2",
			subject: "Test Email 2",
			from: "sender2@example.com",
			to: "receiver2@example.com",
		});
	});

	it("returns 401 if user is not authenticated", async () => {
		shouldAuthenticate = false;
		const res = await request(app).get("/api/analyze-mail");
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty("message");
	});
});
