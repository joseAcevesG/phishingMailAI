export const ErrorMessages = {
	FREE_TRIAL_EXPIRED: 'You are out of free tries',
	INVALID_API_KEY: 'Your OpenAI API key is invalid',
	FAILED_ANALYSIS: 'Failed to analyze email',
	GENERIC_ERROR: 'An error occurred',
} as const;

export type ErrorMessageKeys = keyof typeof ErrorMessages;
export type ErrorMessageValues = typeof ErrorMessages[ErrorMessageKeys];

export default ErrorMessages;
