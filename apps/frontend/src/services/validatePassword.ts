const LUDS_MIN_LENGTH = 8;
const LUDS_REQUIRED_TYPES = 4;

/**
 * Validate a password string against the following rules:
 * - Must have at least LUDS_MIN_LENGTH characters.
 * - Must contain at least LUDS_REQUIRED_TYPES of the following types:
 *   lowercase letters, uppercase letters, digits, symbols.
 *
 * @param {string} password The password to validate.
 *
 * @returns {string[]} An array of error messages. If the password is valid,
 *   the array is empty.
 */
export const validatePassword = (password: string) => {
	const errors: string[] = [];
	if (password.length < LUDS_MIN_LENGTH) {
		errors.push(
			`The password must have at least ${LUDS_MIN_LENGTH} characters.`,
		);
	}
	// check for lowercase, uppercase, digit, symbol
	const checks = {
		lower: /[a-z]/.test(password),
		upper: /[A-Z]/.test(password),
		digit: /\d/.test(password),
		symbol: /[^A-Za-z0-9]/.test(password),
	};
	// count the number of true values in checks
	const passedTypes = Object.values(checks).filter(Boolean).length;
	if (passedTypes < LUDS_REQUIRED_TYPES) {
		errors.push(
			`The password must contain at least ${LUDS_REQUIRED_TYPES} of the following types: lowercase letters, uppercase letters, digits, symbols.`,
		);
	}
	return errors;
};

/**
 * Validate two password strings against the following rules:
 * - The password must have at least LUDS_MIN_LENGTH characters.
 * - The password must contain at least LUDS_REQUIRED_TYPES of the following types:
 *   lowercase letters, uppercase letters, digits, symbols.
 * - The two passwords must match.
 *
 * @param {string} password The first password to validate.
 * @param {string} confirmPassword The second password to validate.
 *
 * @returns {string | null} An error message if the passwords do not match or
 *   are invalid, otherwise null.
 */
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
