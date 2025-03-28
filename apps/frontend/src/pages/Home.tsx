import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile?.name.endsWith(".eml")) {
			setFile(selectedFile);
			setError(null);
		} else {
			setFile(null);
			setError("Please select a valid .eml file");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return;

		setUploading(true);
		setError(null);

		try {
			// For development, simulate file upload
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Uncomment when backend is ready
			/*
      const formData = new FormData();
      formData.append('email', file);

      const response = await fetch('/api/analyze-email', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze email');
      }
      */

			navigate("/result");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="home-container">
			<div className="upload-card">
				<h1>Upload Email for Analysis</h1>
				<form className="upload-form" onSubmit={handleSubmit}>
					<div className="file-input-container">
						<input
							accept=".eml"
							className="file-input"
							id="email-file"
							onChange={handleFileChange}
							type="file"
						/>
						<label className="file-label" htmlFor="email-file">
							{file ? file.name : "Choose .eml file"}
						</label>
					</div>
					{error && <p className="error-message">{error}</p>}
					<button
						className="submit-button"
						disabled={!file || uploading}
						type="submit"
					>
						{uploading ? "Analyzing..." : "Analyze Email"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Home;
