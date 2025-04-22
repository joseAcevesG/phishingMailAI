export const authTypes = {
	magicLink: "magic_link",
	passwordLogin: "password_login",
} as const;

export const AUTH_TYPE_VALUES = Object.values(authTypes);
