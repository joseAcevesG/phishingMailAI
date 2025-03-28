import { useState } from "react";
import "./UploadForm.css";

interface UploadFormProps {
	onAnalyze: (file: File) => Promise<void>;
	isUploading: boolean;
}

export const UploadForm = ({ onAnalyze, isUploading }: UploadFormProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);

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
		try {
			await onAnalyze(file);
			setFile(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		}
	};

	return (
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
					disabled={!file || isUploading}
					type="submit"
				>
					{isUploading ? "Analyzing..." : "Analyze Email"}
				</button>
			</form>
		</div>
	);
};
