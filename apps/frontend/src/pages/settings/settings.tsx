import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./settings.module.css";

const ApiKeyForm: React.FC = () => {
	const [apiKey, setApiKey] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		const controller = new AbortController();

		try {
			const response = await fetch("/api/auth/changeTrial", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ api_key: apiKey }),
				signal: controller.signal,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to set API key");
			}

			// Success - redirect to home
			navigate("/");
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				// Fetch was aborted, do nothing
				return;
			}
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSubmitting(false);
			controller.abort();
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
