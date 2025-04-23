export const authTypes = {
	magicLink: "magic_links",
	passwordLogin: "password_login",
	passwordReset: "reset_password",
} as const;

export const AUTH_TYPE_VALUES = Object.values(authTypes);
