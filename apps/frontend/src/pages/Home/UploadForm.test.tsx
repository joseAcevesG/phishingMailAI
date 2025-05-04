import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadForm } from "./UploadForm";

function createFile(name = "test.eml", type = "message/rfc822") {
	return new File(["dummy content"], name, { type });
}

describe("UploadForm", () => {
	const mockOnAnalyze = vi.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders upload form and button", () => {
		render(<UploadForm onAnalyze={mockOnAnalyze} isUploading={false} />);
		expect(screen.getByText(/upload email for analysis/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /analyze email/i })
		).toBeInTheDocument();
	});

	it("disables submit when no file is selected", () => {
		render(<UploadForm onAnalyze={mockOnAnalyze} isUploading={false} />);
		const button = screen.getByRole("button", { name: /analyze email/i });
		expect(button).toBeDisabled();
	});

	it("shows file name when selected and enables submit", async () => {
		render(<UploadForm onAnalyze={mockOnAnalyze} isUploading={false} />);
		const input = screen.getByLabelText(/choose .eml file/i);
		const file = createFile();
		await fireEvent.change(input, { target: { files: [file] } });
		expect(screen.getByText(file.name)).toBeInTheDocument();
		const button = screen.getByRole("button", { name: /analyze email/i });
		expect(button).not.toBeDisabled();
	});

	it("shows error for invalid file type", async () => {
		render(<UploadForm onAnalyze={mockOnAnalyze} isUploading={false} />);
		const input = screen.getByLabelText(/choose .eml file/i);
		const invalidFile = createFile("not-an-email.txt", "text/plain");
		await fireEvent.change(input, { target: { files: [invalidFile] } });
		expect(
			screen.getByText(/please select a valid .eml file/i)
		).toBeInTheDocument();
	});

	it("calls onAnalyze with selected file on submit", async () => {
		render(<UploadForm onAnalyze={mockOnAnalyze} isUploading={false} />);
		const input = screen.getByLabelText(/choose .eml file/i);
		const file = createFile();
		await fireEvent.change(input, { target: { files: [file] } });
		const button = screen.getByRole("button", { name: /analyze email/i });
		await fireEvent.click(button);
		expect(mockOnAnalyze).toHaveBeenCalledWith(file);
	});

	it("shows loading state on submit", () => {
		render(<UploadForm onAnalyze={mockOnAnalyze} isUploading={true} />);
		expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
	});
});
