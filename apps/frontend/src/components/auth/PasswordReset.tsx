import { useEffect, useState } from "react";
import styles from "./Password.module.css";
import { validateAll } from "../../services/validatePassword";
import { useFetch } from "../../hooks/useFetch";
import type { APIMessage } from "../../types";
import { useSearchParams, useNavigate } from "react-router-dom";

const PasswordReset: React.FC = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const {
		error: fetchError,
		loading: isSubmitting,
		execute,
	} = useFetch<APIMessage>(
		{
			url: `/api/auth/authenticate?${searchParams.toString()}`,
			method: "POST",
		},
		false
	);

	useEffect(() => {
		setValidationError(validateAll(password, confirmPassword));
	}, [password, confirmPassword]);

	const [validationError, setValidationError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({ body: { password } });
		if (result) {
			navigate("/login");
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div className={styles.inputGroup}>
				<input
					className={styles.passwordInput}
					type="password"
					placeholder="Confirm your password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>
			{(validationError || fetchError) && (
				<p className={styles.errorMessage}>{validationError || fetchError}</p>
			)}
			<button
				className={styles.loginButton}
				type="submit"
				disabled={
					isSubmitting || !password || !confirmPassword || !!validationError
				}
			>
				{isSubmitting ? "Resetting..." : "Reset Password"}
			</button>
		</form>
	);
};

export default PasswordReset;
