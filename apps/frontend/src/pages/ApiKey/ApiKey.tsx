import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ApiKey.module.css";

const ApiKeyForm = () => {
	const [apiKey, setApiKey] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await fetch("/api/auth/changeTrial", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ api_key: apiKey }),
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ message: "Failed to set API key" }));
				throw new Error(errorData.message || "Failed to set API key");
			}

			// Success - redirect to home
			navigate("/");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div id="api-key-form" className={styles.apiKeyFormContainer}>
			<h1>Set OpenAI API Key</h1>
			<p>Please enter your OpenAI API key to continue using the service.</p>

			{error && <div className={styles.errorMessage}>{error}</div>}

			<form onSubmit={handleSubmit} className={styles.apiKeyForm}>
				<div className={styles.formGroup}>
					<label htmlFor="apiKey">API Key:</label>
					<input
						type="password"
						id="apiKey"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="sk-..."
						required
					/>
				</div>
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Submitting..." : "Save API Key"}
				</button>
			</form>
		</div>
	);
};

export default ApiKeyForm;
