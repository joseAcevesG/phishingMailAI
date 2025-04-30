import { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage, History } from "../../types";

export function useHistoryList() {
  const {
    data: history,
    error,
    loading,
  } = useFetch<History[]>({ url: "/api/analyze-mail" });

  // Local state for optimistic UI
  const [historyList, setHistoryList] = useState<History[] | null>(null);

  // Sync local state when fetched data changes
  useEffect(() => {
    if (history) setHistoryList(history);
  }, [history]);

  const { execute: deleteHistory } = useFetch<APIMessage>(
    { url: "/api/analyze-mail/:id", method: "DELETE" },
    false
  );

  const handleDelete = async (id: string) => {
    if (!historyList) return;
    // Optimistically remove from UI
    const prevList = historyList;
    setHistoryList(historyList.filter((item) => item._id !== id));
    const result = await deleteHistory({ url: `/api/analyze-mail/${id}` });
    if (!result) {
      setHistoryList(prevList);
    }
  };

  return {
    historyList,
    setHistoryList,
    loading,
    error,
    handleDelete,
  };
}
