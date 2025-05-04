import { useCallback, useEffect, useRef, useState } from "react";
import type { FetchConfig, UseFetchReturn } from "../types";

const DEFAULT_HEADERS = {
	"Content-Type": "application/json",
};

export function useFetch<T = unknown>(
	initialConfig: FetchConfig,
	auto = true,
): UseFetchReturn<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const configRef = useRef<FetchConfig>(initialConfig);
	const controllerRef = useRef<AbortController | null>(null);

	const execute = useCallback(async (overrideConfig?: Partial<FetchConfig>) => {
		controllerRef.current?.abort();
		const config = {
			...configRef.current,
			...overrideConfig,
			headers: { ...DEFAULT_HEADERS, ...overrideConfig?.headers },
		};
		configRef.current = config;
		const { url, method = "GET", headers, body, credentials } = config;
		const finalHeaders =
			body instanceof FormData
				? Object.fromEntries(
						Object.entries(headers).filter(
							([key]) => key.toLowerCase() !== "content-type",
						),
					)
				: headers;
		controllerRef.current = new AbortController();
		setLoading(true);
		setError(null);

		try {
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
			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				const message =
					response.status >= 500
						? "Something went wrong"
						: errorData?.message || response.statusText;
				throw new Error(message);
			}
			const result: T = await response.json().catch(() => null);
			setData(result);
			return result;
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === "AbortError") return null;
			setError(err instanceof Error ? err.message : "Request failed");
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

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
