export const ErrorMessages = {
	FREE_TRIAL_EXPIRED: "You are out of free tries",
	INVALID_API_KEY: "Your OpenAI API key is invalid",
	FAILED_ANALYSIS: "Failed to analyze email",
	GENERIC_ERROR: "An error occurred",
	FAILED_TO_FETCH_ANALYSIS: "Failed to fetch analysis",
	FAILED_TO_LOGIN: "Failed to login",
	FAILED_TO_FETCH_HISTORY: "Failed to fetch history",
	FAILED_TO_SET_API_KEY: "Failed to set API key",
} as const;

export type ErrorMessageKeys = keyof typeof ErrorMessages;
export type ErrorMessageValues = (typeof ErrorMessages)[ErrorMessageKeys];

export default ErrorMessages;
