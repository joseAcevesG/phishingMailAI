import { useRef, useState } from "react";
import styles from "./UploadForm.module.css";

interface Props {
	onAnalyze: (file: File) => Promise<void>;
	isUploading: boolean;
}

export const UploadForm: React.FC<Props> = ({ onAnalyze, isUploading }) => {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

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

	const handleDrop = (
		e: React.DragEvent<HTMLLabelElement | HTMLDivElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		const droppedFile = e.dataTransfer.files?.[0];
		if (droppedFile?.name.endsWith(".eml")) {
			setFile(droppedFile);
			setError(null);
			// Optionally, update the file input's value
			if (inputRef.current) {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(droppedFile);
				inputRef.current.files = dataTransfer.files;
			}
		} else {
			setFile(null);
			setError("Please select a valid .eml file");
		}
	};

	const handleDragOver = (
		e: React.DragEvent<HTMLLabelElement | HTMLDivElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	};

	const handleDragLeave = (
		e: React.DragEvent<HTMLLabelElement | HTMLDivElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
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
				<div
					className={styles.fileInputContainer}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<input
						accept=".eml"
						className={styles.fileInput}
						id="file-input"
						onChange={handleFileChange}
						ref={inputRef}
						type="file"
					/>
					<label
						className={
							dragActive
								? `${styles.fileInputLabel} ${styles.dragActive}`
								: styles.fileInputLabel
						}
						htmlFor="file-input"
						onDragLeave={handleDragLeave}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					>
						{file ? file.name : "Choose .eml file (Drag & Drop supported)"}
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
