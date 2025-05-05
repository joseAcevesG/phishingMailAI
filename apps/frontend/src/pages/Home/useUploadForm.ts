import { useRef, useState } from "react";

/**
 * Hook for handling file uploads.
 *
 * Returns an object with the following properties:
 * - `file`: The currently selected file, or `null` if no file is selected.
 * - `error`: An error message if the file is invalid or uploading failed, or `null` otherwise.
 * - `dragActive`: A boolean indicating whether a file is currently being dragged over the drop zone.
 * - `inputRef`: A reference to the input element for selecting a file.
 * - `handleFileChange`: A function that updates the `file` state with the selected file.
 * - `handleDrop`: A function that updates the `file` state with the dropped file.
 * - `handleDragOver`: A function that sets `dragActive` to `true` when a file is dragged over the drop zone.
 * - `handleDragLeave`: A function that sets `dragActive` to `false` when a file is dragged out of the drop zone.
 * - `handleSubmit`: A function that calls `onAnalyze` with the selected file and resets the `file` state.
 * - `setError`: A function that updates the `error` state with the given error message.
 * - `setFile`: A function that updates the `file` state with the given file.
 */
export function useUploadForm(onAnalyze: (file: File) => Promise<void>) {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	/**
	 * Handles file input change event.
	 *
	 * Sets the selected file to the state if it is a valid .eml file,
	 * otherwise sets an error message.
	 *
	 * @param e - The change event triggered by file input.
	 */
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

	/**
	 * Handles file drop event.
	 *
	 * Prevents the default event behavior, checks if the dropped file is a valid .eml file,
	 * and sets the file state accordingly. If the file is valid, also sets the input element's
	 * files property to the dropped file using a DataTransfer object, so that the file can
	 * be submitted with the form.
	 *
	 * @param e - The drop event triggered by dropping a file over the drop zone.
	 */
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

	/**
	 * Handles the dragover event triggered when a file is dragged over the drop zone.
	 *
	 * Prevents the default event behavior and sets the dragActive state to true, so that
	 * the drop zone is highlighted, indicating that it is a valid drop target.
	 *
	 * @param e - The dragover event triggered by dragging a file over the drop zone.
	 */
	const handleDragOver = (
		e: React.DragEvent<HTMLLabelElement | HTMLDivElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	};

	/**
	 * Handles the dragleave event triggered when a file is dragged out of the drop zone.
	 *
	 * Prevents the default event behavior and sets the dragActive state to false, so that
	 * the drop zone is no longer highlighted, indicating that it is no longer a valid drop target.
	 *
	 * @param e - The dragleave event triggered by dragging a file out of the drop zone.
	 */
	const handleDragLeave = (
		e: React.DragEvent<HTMLLabelElement | HTMLDivElement>,
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	};

	/**
	 * Handles form submission to analyze the selected email file.
	 *
	 * Prevents the default form submission behavior, checks if a file is
	 * selected, and calls the `onAnalyze` function with the file.
	 * Resets the file state upon successful analysis, or sets an error
	 * message if the analysis fails.
	 *
	 * @param e - The form submission event.
	 */
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

	return {
		file,
		error,
		dragActive,
		inputRef,
		handleFileChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleSubmit,
		setError,
		setFile,
	};
}
