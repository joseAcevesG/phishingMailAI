import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";

export function useSettings() {
	const [apiKey, setApiKey] = useState("");
	const navigate = useNavigate();

	// change trial / save key
	const {
		execute: saveKey,
		error: keyError,
		loading: keyLoading,
	} = useFetch<APIMessage>(
		{ url: "/api/auth/change-trial", method: "POST" },
		false,
	);

	// logout everywhere
	const {
		execute: logoutAll,
		error: logoutError,
		loading: logoutLoading,
	} = useFetch<APIMessage>(
		{ url: "/api/auth/logout-all", method: "POST" },
		false,
	);

	const handleKeySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await saveKey({ body: { api_key: apiKey } });
		if (res) navigate("/");
	};

	const handleLogoutAll = async () => {
		const res = await logoutAll();
		if (res) navigate("/login");
	};

	return {
		apiKey,
		setApiKey,
		keyError,
		keyLoading,
		handleKeySubmit,
		logoutError,
		logoutLoading,
		handleLogoutAll,
	};
}
