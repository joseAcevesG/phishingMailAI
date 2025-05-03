import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Analysis } from "shared";
import { useFetch } from "../../hooks/useFetch";

export function useAnalyze() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const {
		data: analysis,
		error,
		loading,
		execute,
	} = useFetch<Analysis>({ url: `/api/analyze-mail/${id}` }, false);

	useEffect(() => {
		execute();
	}, [execute]);

	return { analysis, error, loading, navigate };
}
