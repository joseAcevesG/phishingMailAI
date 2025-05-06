let onUnauthorizedGlobal: (() => void) | null = null;

// Set the handler for the onUnauthorized callback
export const setOnUnauthorized = (handler: () => void) => {
	onUnauthorizedGlobal = handler;
};

// Get the handler for the onUnauthorized callback
export const getOnUnauthorized = () => onUnauthorizedGlobal;
