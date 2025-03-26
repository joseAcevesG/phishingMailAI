export const ResponseCodes = {
	SUCCESS: {
		code: 200,
		message: "Success",
	},
	CREATED: {
		code: 201,
		message: "Created successfully",
	},
	BAD_REQUEST: {
		code: 400,
		message: "The server cannot process the request due to invalid syntax",
	},
	UNAUTHORIZED: {
		code: 401,
		message: "Authentication is required to access this resource",
	},
	FORBIDDEN: {
		code: 403,
		message: "You don't have permission to access this resource",
	},
	NOT_FOUND: {
		code: 404,
		message: "The requested resource could not be found",
	},
	INTERNAL_SERVER_ERROR: {
		code: 500,
		message:
			"Something went wrong on our end. Please try again later or contact support if the issue persists",
	},
} as const;

// Extract types from the object
export type ResponseCodeKeys = keyof typeof ResponseCodes;
export type ResponseCodeValues = (typeof ResponseCodes)[ResponseCodeKeys];

export default ResponseCodes;
