import { useCallback, useEffect, useRef, useState } from "react";
import { getOnUnauthorized } from "../services/authHandler";
import type { FetchConfig, UseFetchReturn } from "../types";

const DEFAULT_HEADERS = {
	"Content-Type": "application/json",
};

/**
 * Custom React hook for making fetch requests.
 *
 * @template T - The expected shape of the response data.
 * @param {FetchConfig} initialConfig - Initial configuration for the fetch request.
 * @param {boolean} [auto=true] - Whether to automatically execute the request on mount.
 * @returns {UseFetchReturn<T>} - An object containing the response data, error, loading state, and an execute function to manually trigger the request.
 */
export function useFetch<T = unknown>(
	initialConfig: FetchConfig,
	auto = true,
): UseFetchReturn<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const configRef = useRef<FetchConfig>(initialConfig);
	const controllerRef = useRef<AbortController | null>(null);

	/**
	 * Manually trigger the fetch request with an optional override configuration.
	 *
	 * @param {Partial<FetchConfig>} [overrideConfig] - Optional override configuration for the fetch request.
	 * @returns {Promise<T | null>} - A promise that resolves with the response data or null if the request is aborted.
	 */
	const execute = useCallback(async (overrideConfig?: Partial<FetchConfig>) => {
		// Abort any ongoing fetch before starting a new one
		controllerRef.current?.abort();
		// Merge default config, current config, and any override config for this request
		const config = {
			...configRef.current,
			...overrideConfig,
			headers: { ...DEFAULT_HEADERS, ...overrideConfig?.headers },
		};
		configRef.current = config;
		const {
			url,
			method = "GET",
			headers,
			body,
			credentials,
			onUnauthorized,
		} = config;

		// If sending FormData, remove content-type so browser sets it correctly
		const finalHeaders =
			body instanceof FormData
				? Object.fromEntries(
						Object.entries(headers).filter(
							([key]) => key.toLowerCase() !== "content-type",
						),
					)
				: headers;

		// Create a new AbortController for the current request
		controllerRef.current = new AbortController();
		setLoading(true);
		setError(null);

		try {
			// For GET requests with a body, serialize body as query params
			const response = await fetch(
				method === "GET" && body
					? `${url}?${new URLSearchParams(body as Record<string, string>).toString()}`
					: url,
				{
					method,
					headers: finalHeaders,
					body:
						method !== "GET"
							? body instanceof FormData
								? body
								: JSON.stringify(body)
							: undefined,
					credentials,
					signal: controllerRef.current.signal,
				},
			);
			// Handle unauthorized (401) responses
			if (response.status === 401) {
				const errorData = await response.json().catch(() => null);
				const message =
					response.status >= 500
						? "Something went wrong"
						: errorData?.message || response.statusText;
				if (onUnauthorized) onUnauthorized(message);
				else {
					alert("your session has expired.\nPlease log in again.");
					getOnUnauthorized()?.();
				}
				return null;
			}
			// Handle non-OK responses (other errors)
			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				const message =
					response.status >= 500
						? "Something went wrong"
						: errorData?.message || response.statusText;
				throw new Error(message);
			}
			// Parse response JSON as result, set data state
			const result: T = await response.json().catch(() => null);
			setData(result);
			return result;
		} catch (err: unknown) {
			// Ignore abort errors (user navigated away, etc.)
			if (err instanceof DOMException && err.name === "AbortError") return null;
			// Set error state for all other errors
			setError(err instanceof Error ? err.message : "Request failed");
			return null;
		} finally {
			// Always stop loading state
			setLoading(false);
		}
	}, []);

	// automatically execute the fetch request on mount if auto is true
	useEffect(() => {
		if (auto) {
			execute();
		}
		return () => {
			controllerRef.current?.abort();
		};
	}, [auto, execute]);

	return { data, error, loading, execute };
}
