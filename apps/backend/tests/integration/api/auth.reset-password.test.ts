import { StytchError } from "stytch";

vi.mock("stytch", () => {
  class StytchError extends Error {
    error_type: string;
    error_message: string;
    status_code: number;
    request_id: string;
    error_url: string;
    constructor({ error_type, error_message, status_code, request_id, error_url }: { error_type: string; error_message: string; status_code: number; request_id: string; error_url: string; }) {
      super(error_message);
      this.error_type = error_type;
      this.error_message = error_message;
      this.status_code = status_code;
      this.request_id = request_id;
      this.error_url = error_url;
    }
  }
  return {
    default: {
      Client: vi.fn().mockImplementation(() => ({
        passwords: {
          email: {
            resetStart: vi.fn().mockResolvedValue({}),
          },
        },
      })),
    },
    StytchError,
  };
});

vi.mock("../../../src/config/stytch", () => ({
  stytchClient: {
    passwords: {
      email: {
        resetStart: vi.fn().mockResolvedValue({}),
      },
    },
  },
}));

import request from "supertest";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { stytchClient } from "../../../src/config/stytch";
import app from "../../../src/index";

describe("POST /api/auth/reset-password", () => {
  const validEmail = "testuser@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends password reset link for valid email", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: validEmail })
      .expect(200);

    expect(res.body).toHaveProperty("message", "Password reset link sent successfully");
    expect(stytchClient.passwords.email.resetStart).toHaveBeenCalledWith({ email: validEmail });
  });

  it("returns 400 for missing email", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({})
      .expect(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "not-an-email" })
      .expect(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 if stytch returns invalid_email error", async () => {
    (stytchClient.passwords.email.resetStart as Mock).mockRejectedValueOnce(
      new StytchError({
        error_type: "invalid_email",
        error_message: "Invalid email",
        status_code: 400,
        request_id: "mock-request-id",
        error_url: "https://example.com/error",
      })
    );
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ email: "bademail@example.com" })
      .expect(400);
    expect(res.body).toHaveProperty("message");
  });
});
