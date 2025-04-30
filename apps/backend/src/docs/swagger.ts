const swaggerSpec = {
	openapi: "3.0.0",
	info: {
		title: "PhishingMailAI API",
		version: "1.0.0",
		description: "API documentation for PhishingMailAI",
	},
	tags: [
		{
			name: "Authentication",
			description:
				"Endpoints related to user authentication and account management.",
		},
		{
			name: "Mail Analysis",
			description: "Endpoints for analyzing and managing emails.",
		},
	],
	servers: [
		{
			url: "/api",
		},
	],
	paths: {
		"/analyze-mail/validate": {
			post: {
				tags: ["Mail Analysis"],
				summary: "Validate and analyze an uploaded email file (EML)",
				description:
					"Uploads an .eml file, parses it, and analyzes its content.",
				requestBody: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: {
								type: "object",
								properties: {
									emlFile: {
										type: "string",
										format: "binary",
										description: "EML file to be analyzed",
									},
								},
								required: ["emlFile"],
							},
						},
					},
				},
				responses: {
					200: { description: "Analysis completed successfully" },
					400: { description: "Invalid or missing email file" },
					401: {
						description:
							"Unauthorized. Missing or invalid session/refresh token.",
					},
					403: {
						description:
							"Forbidden. Free trial limit exceeded or missing API key.",
					},
					500: { description: "Internal server error." },
				},
			},
		},
		"/analyze-mail": {
			get: {
				tags: ["Mail Analysis"],
				summary: "Get all analyzed emails for the authenticated user",
				responses: {
					200: { description: "List of analyzed emails" },
					401: {
						description:
							"Unauthorized. Missing or invalid session/refresh token.",
					},
					500: { description: "Internal server error." },
				},
			},
		},
		"/analyze-mail/{id}": {
			get: {
				tags: ["Mail Analysis"],
				summary: "Get a specific analyzed email by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
						description: "Email analysis ID",
					},
				],
				responses: {
					200: { description: "Email analysis found" },
					404: { description: "Email analysis not found" },
					401: {
						description:
							"Unauthorized. Missing or invalid session/refresh token.",
					},
					500: { description: "Internal server error." },
				},
			},
			delete: {
				tags: ["Mail Analysis"],
				summary: "Delete a specific analyzed email by ID",
				parameters: [
					{
						name: "id",
						in: "path",
						required: true,
						schema: { type: "string" },
						description: "Email analysis ID",
					},
				],
				responses: {
					200: { description: "Email analysis deleted" },
					404: { description: "Email analysis not found" },
					401: {
						description:
							"Unauthorized. Missing or invalid session/refresh token.",
					},
					500: { description: "Internal server error." },
				},
			},
		},
		"/": {
			get: {
				summary: "Root endpoint for API health check",
				responses: {
					200: {
						description: "Returns a simple status message",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										name: {
											type: "string",
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/auth/signup": {
			post: {
				summary: "Sign up a new user",
				tags: ["Authentication"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									type: {
										type: "string",
										enum: ["magicLink", "passwordLogin"],
										description: "Authentication type",
									},
									email: {
										type: "string",
										format: "email",
									},
									password: {
										type: "string",
										description: "Password (required for passwordLogin)",
									},
								},
								required: ["type", "email"],
							},
						},
					},
				},
				responses: {
					201: { description: "User created successfully" },
					400: { description: "Invalid input or user already exists" },
				},
			},
		},
		"/auth/login": {
			post: {
				summary: "Log in a user",
				tags: ["Authentication"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									type: {
										type: "string",
										enum: ["magicLink", "passwordLogin"],
										description: "Authentication type",
									},
									email: {
										type: "string",
										format: "email",
									},
									password: {
										type: "string",
										description: "Password (required for passwordLogin)",
									},
								},
								required: ["type", "email"],
							},
						},
					},
				},
				responses: {
					200: { description: "Login successful" },
					400: { description: "Invalid credentials" },
				},
			},
		},
		"/auth/reset-password": {
			post: {
				summary: "Request a password reset",
				tags: ["Authentication"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									email: {
										type: "string",
										format: "email",
									},
								},
								required: ["email"],
							},
						},
					},
				},
				responses: {
					200: { description: "Password reset email sent" },
					400: { description: "Invalid email or request" },
				},
			},
		},
		"/auth/authenticate": {
			post: {
				summary: "Authenticate a user with a token",
				tags: ["Authentication"],
				parameters: [
					{
						name: "token",
						in: "query",
						required: true,
						schema: { type: "string" },
					},
					{
						name: "stytch_token_type",
						in: "query",
						required: true,
						schema: {
							type: "string",
							enum: ["magicLink", "login", "passwordReset"],
						},
					},
				],
				requestBody: {
					required: false,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									password: { type: "string" },
								},
							},
						},
					},
				},
				responses: {
					200: { description: "Authentication successful" },
					400: { description: "Invalid token or request" },
				},
			},
		},
		"/auth/logout": {
			post: {
				summary: "Logout the current user",
				tags: ["Authentication"],
				responses: {
					200: { description: "Logout successful" },
					401: { description: "Unauthorized" },
				},
			},
		},
		"/auth/logout-all": {
			post: {
				summary: "Logout from all sessions",
				tags: ["Authentication"],
				responses: {
					200: { description: "All sessions logged out" },
					401: { description: "Unauthorized" },
				},
			},
		},
		"/auth/change-trial": {
			post: {
				summary: "Change trial status for the user",
				tags: ["Authentication"],
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									api_key: { type: "string" },
								},
								required: ["api_key"],
							},
						},
					},
				},
				responses: {
					200: { description: "Trial status changed" },
					401: { description: "Unauthorized" },
					400: { description: "Invalid request" },
				},
			},
		},
		"/auth/status": {
			get: {
				summary: "Get the authentication status of the current user",
				tags: ["Authentication"],
				responses: {
					200: { description: "Status fetched successfully" },
					401: { description: "Unauthorized" },
				},
			},
		},
	},
};

export default swaggerSpec;
