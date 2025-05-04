import styles from "./UploadForm.module.css";
import { useUploadForm } from "./useUploadForm";

interface Props {
	onAnalyze: (file: File) => Promise<void>;
	isUploading: boolean;
}

export const UploadForm: React.FC<Props> = ({ onAnalyze, isUploading }) => {
	const {
		file,
		error,
		dragActive,
		inputRef,
		handleFileChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleSubmit,
	} = useUploadForm(onAnalyze);

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
