export const authTypes = {
	magicLink: "magic_links",
	passwordLogin: "password_login",
} as const;

export const AUTH_TYPE_VALUES = Object.values(authTypes);
