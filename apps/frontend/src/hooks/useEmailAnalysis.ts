import { useNavigate } from "react-router-dom";
import type { Analysis } from "shared";
import { useFetch } from "./useFetch";

export const useEmailAnalysis = () => {
	const navigate = useNavigate();
	const {
		execute,
		error,
		loading: uploading,
	} = useFetch<Analysis>(
		{ url: "/api/analyze-mail/validate", method: "POST" },
		false,
	);

	const analyzeEmail = async (file: File) => {
		const formData = new FormData();
		formData.append("emlFile", file);
		const result = await execute({ body: formData });
		if (result) {
			navigate(`/analyze/${result._id}`);
		}
	};

	const reset = () => {
		// setError(null); // This line is not needed anymore
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
