import { useState } from "react";
import styles from "./UploadForm.module.css";

interface Props {
	onAnalyze: (file: File) => Promise<void>;
	isUploading: boolean;
}

export const UploadForm = ({ onAnalyze, isUploading }: Props) => {
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
		<div className={styles.uploadCard}>
			<h1>Upload Email for Analysis</h1>
			<form className={styles.uploadForm} onSubmit={handleSubmit}>
				<div className={styles.fileInputContainer}>
					<input
						accept=".eml"
						className={styles.fileInput}
						id="file-input"
						onChange={handleFileChange}
						type="file"
					/>
					<label className={styles.fileInputLabel} htmlFor="file-input">
						{file ? file.name : "Choose .eml file"}
					</label>
				</div>
				{error && <p className={styles.errorMessage}>{error}</p>}
				<button
					className={styles.submitButton}
					disabled={!file || isUploading}
					type="submit"
				>
					{isUploading ? "Analyzing..." : "Analyze Email"}
				</button>
			</form>
		</div>
	);
};
