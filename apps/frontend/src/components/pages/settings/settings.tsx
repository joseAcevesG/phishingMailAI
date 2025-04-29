import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch";
import styles from "./settings.module.css";
import type { APIMessage } from "../../../types";

const ApiKeyForm: React.FC = () => {
	const [apiKey, setApiKey] = useState("");
	const navigate = useNavigate();
	const { execute, error, loading } = useFetch<APIMessage>(
		{
			url: "/api/auth/change-trial",
			method: "POST",
		},
		false
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await execute({ body: { api_key: apiKey } });
		if (result) navigate("/");
	};

	return (
		<div className={styles.apiKeyFormContainer} id="api-key-form">
			<h1>Set OpenAI API Key</h1>
			<p>Please enter your OpenAI API key to continue using the service.</p>

			{error && <div className={styles.errorMessage}>{error}</div>}

			<form className={styles.apiKeyForm} onSubmit={handleSubmit}>
				<div className={styles.formGroup}>
					<label htmlFor="apiKey">API Key:</label>
					<input
						id="apiKey"
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="sk-..."
						required
						type="password"
						value={apiKey}
					/>
				</div>
				<button disabled={loading} type="submit">
					{loading ? "Submitting..." : "Save API Key"}
				</button>
			</form>
			<Link className={styles.link} to="/reset-password-link">
				Reset Password
			</Link>
		</div>
	);
};

export default ApiKeyForm;
