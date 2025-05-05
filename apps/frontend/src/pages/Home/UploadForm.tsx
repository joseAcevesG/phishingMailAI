import styles from "./UploadForm.module.css";
import { useUploadForm } from "./useUploadForm";

interface Props {
	onAnalyze: (file: File) => Promise<void>;
	isUploading: boolean;
}

/**
 * A form component for uploading an email file (EML) for analysis.
 *
 * Props:
 * - `onAnalyze(file: File)`: Called when the user submits the form, passing the
 *   uploaded file as an argument.
 * - `isUploading: boolean`: Indicates whether an analysis is currently in progress.
 *
 * The component renders a card with an input field for selecting an EML file,
 * a submit button, and an error message if the user selects an invalid file.
 * The card also has drag-and-drop support.
 */
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
					{/* File input for selecting .eml files */}
					<input
						accept=".eml"
						className={styles.fileInput}
						id="file-input"
						onChange={handleFileChange}
						ref={inputRef}
						type="file"
					/>
					{/* Label acts as a drop zone and displays selected file name or prompt */}
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
				{/* Show error message if file type or selection is invalid */}
				{error && <p className={styles.errorMessage}>{error}</p>}
				{/* Submit button is disabled until a valid file is selected or while uploading */}
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
