import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UploadForm from "./UploadForm";

// Helper to create a mock .eml file for testing file input
function createFile(name = "test.eml", type = "message/rfc822") {
	return new File(["dummy content"], name, { type });
}

describe("UploadForm", () => {
	// Mock callback for form submission
	const mockOnAnalyze = vi.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Test: Should render upload form and analyze button
	it("renders upload form and button", () => {
		render(<UploadForm isUploading={false} onAnalyze={mockOnAnalyze} />);
		expect(screen.getByText(/upload email for analysis/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /analyze email/i })
		).toBeInTheDocument();
	});

	// Test: Should disable submit button when no file is selected
	it("disables submit when no file is selected", () => {
		render(<UploadForm isUploading={false} onAnalyze={mockOnAnalyze} />);
		const button = screen.getByRole("button", { name: /analyze email/i });
		expect(button).toBeDisabled();
	});

	// Test: Should show file name and enable submit when a valid file is selected
	it("shows file name when selected and enables submit", async () => {
		render(<UploadForm isUploading={false} onAnalyze={mockOnAnalyze} />);
		const input = screen.getByLabelText(/choose .eml file/i);
		const file = createFile();
		await fireEvent.change(input, { target: { files: [file] } });
		expect(screen.getByText(file.name)).toBeInTheDocument();
		const button = screen.getByRole("button", { name: /analyze email/i });
		expect(button).not.toBeDisabled();
	});

	// Test: Should show error for invalid file type
	it("shows error for invalid file type", async () => {
		render(<UploadForm isUploading={false} onAnalyze={mockOnAnalyze} />);
		const input = screen.getByLabelText(/choose .eml file/i);
		const invalidFile = createFile("not-an-email.txt", "text/plain");
		await fireEvent.change(input, { target: { files: [invalidFile] } });
		expect(
			screen.getByText(/please select a valid .eml file/i)
		).toBeInTheDocument();
	});

	// Test: Should call onAnalyze with selected file on submit
	it("calls onAnalyze with selected file on submit", async () => {
		render(<UploadForm isUploading={false} onAnalyze={mockOnAnalyze} />);
		const input = screen.getByLabelText(/choose .eml file/i);
		const file = createFile();
		await act(async () => {
			await fireEvent.change(input, { target: { files: [file] } });
			const button = screen.getByRole("button", { name: /analyze email/i });
			await fireEvent.click(button);
		});
		expect(mockOnAnalyze).toHaveBeenCalledWith(file);
	});

	// Test: Should show loading state on submit
	it("shows loading state on submit", () => {
		render(<UploadForm isUploading={true} onAnalyze={mockOnAnalyze} />);
		expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
	});
});
