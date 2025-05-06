import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";

export function useHeaderAuth() {
  const { userEmail, validateStatus } = useAuth();
  const { execute: executeLogout } = useFetch<APIMessage>(
    { url: "/api/auth/logout", method: "POST" },
    false
  );

  const handleLogout = async () => {
    await executeLogout();
    validateStatus({ authenticated: false });
  };

  return { userEmail, handleLogout };
}
