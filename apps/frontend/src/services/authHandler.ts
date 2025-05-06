let onUnauthorizedGlobal: (() => void) | null = null;

export const setOnUnauthorized = (handler: () => void) => {
	onUnauthorizedGlobal = handler;
};

export const getOnUnauthorized = () => onUnauthorizedGlobal;
