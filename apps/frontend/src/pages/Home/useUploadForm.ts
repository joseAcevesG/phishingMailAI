import { useRef, useState } from "react";

export function useUploadForm(onAnalyze: (file: File) => Promise<void>) {
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
