const LUDS_MIN_LENGTH = 8;
const LUDS_REQUIRED_TYPES = 4;

export const validatePassword = (password: string) => {
	const errors: string[] = [];
	if (password.length < LUDS_MIN_LENGTH) {
		errors.push(
			`The password must have at least ${LUDS_MIN_LENGTH} characters.`,
		);
	}
	const checks = {
		lower: /[a-z]/.test(password),
		upper: /[A-Z]/.test(password),
		digit: /\d/.test(password),
		symbol: /[^A-Za-z0-9]/.test(password),
	};
	const passedTypes = Object.values(checks).filter(Boolean).length;
	if (passedTypes < LUDS_REQUIRED_TYPES) {
		errors.push(
			`The password must contain at least ${LUDS_REQUIRED_TYPES} of the following types: lowercase letters, uppercase letters, digits, symbols.`,
		);
	}
	return errors;
};

export const validateAll = (password: string, confirmPassword: string) => {
	if (!(password || confirmPassword)) return null;
	if (confirmPassword && password !== confirmPassword) {
		return "Passwords do not match.";
	}
	const pwdErrors = validatePassword(password);
	if (pwdErrors.length > 0) {
		return pwdErrors.join(" ");
	}
	return null;
};
