import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Analysis } from "shared";
import { useFetch } from "../../hooks/useFetch";

export const useMailAnalysis = () => {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const {
		execute,
		error: errorFetch,
		loading: uploading,
	} = useFetch<Analysis>(
		{ url: "/api/analyze-mail/validate", method: "POST" },
		false,
	);

	useEffect(() => {
		if (errorFetch) setError(errorFetch);
	}, [errorFetch]);

	const analyzeEmail = async (file: File) => {
		const formData = new FormData();
		formData.append("emlFile", file);
		const result = await execute({ body: formData });
		if (result) {
			navigate(`/analyze/${result._id}`);
		}
	};

	const reset = () => {
		error && setError(null);
	};

	const goToSetApiKey = () => {
		navigate("/settings");
	};

	return {
		uploading,
		error,
		analyzeEmail,
		reset,
		goToSetApiKey,
	};
};
