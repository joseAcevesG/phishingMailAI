import { fireEvent, render, screen } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorMessages from "../../types/error-messages";
import Home from "./Home";
import { useMailAnalysis } from "./useMailAnalysis";

// Mock UploadForm to isolate Home tests from form implementation
vi.mock("./UploadForm", () => ({
	UploadForm: ({
		isUploading,
		onAnalyze,
	}: {
		isUploading: boolean;
		onAnalyze: () => void;
	}) => (
		<div data-testid="upload-form">
			<button disabled={isUploading} onClick={onAnalyze} type="button">
				Analyze
			</button>
		</div>
	),
}));

// Mocks for Home's dependencies and actions
const mockAnalyzeEmail = vi.fn();
const mockReset = vi.fn();
const mockGoToSetApiKey = vi.fn();

// Mock useMailAnalysis to control Home's state and actions
vi.mock("./useMailAnalysis", () => ({
	useMailAnalysis: vi.fn(),
}));

describe("Home", () => {
	// Reset all mocks and set up default return value before each test
	beforeEach(() => {
		vi.clearAllMocks();
		(useMailAnalysis as Mock).mockReturnValue({
			uploading: false,
			error: null,
			analyzeEmail: mockAnalyzeEmail,
			reset: mockReset,
			goToSetApiKey: mockGoToSetApiKey,
		});
	});

	// Test: Should render UploadForm when there is no error
	it("renders UploadForm when no error", () => {
		render(<Home />);
		expect(screen.getByTestId("upload-form")).toBeInTheDocument();
	});

	// Test: Should call analyzeEmail when Analyze button is clicked
	it("calls analyzeEmail when Analyze button is clicked", () => {
		render(<Home />);
		fireEvent.click(screen.getByText("Analyze"));
		expect(mockAnalyzeEmail).toHaveBeenCalled();
	});

	// Test: Should render error and Try Again button when error is not API key related
	it("renders error and Try Again when error is not API key related", () => {
		(useMailAnalysis as Mock).mockReturnValue({
			uploading: false,
			error: "Some error",
			analyzeEmail: mockAnalyzeEmail,
			reset: mockReset,
			goToSetApiKey: mockGoToSetApiKey,
		});
		render(<Home />);
		expect(screen.getByText("Error")).toBeInTheDocument();
		expect(screen.getByText("Some error")).toBeInTheDocument();
		expect(screen.getByText("Try Again")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Try Again"));
		expect(mockReset).toHaveBeenCalled();
	});

	// Test: Should render Set OpenAI Key button when error is FREE_TRIAL_EXPIRED
	it("renders Set OpenAI Key button when error is FREE_TRIAL_EXPIRED", () => {
		(useMailAnalysis as Mock).mockReturnValue({
			uploading: false,
			error: ErrorMessages.FREE_TRIAL_EXPIRED,
			analyzeEmail: mockAnalyzeEmail,
			reset: mockReset,
			goToSetApiKey: mockGoToSetApiKey,
		});
		render(<Home />);
		expect(screen.getByText("Set OpenAI Key")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Set OpenAI Key"));
		expect(mockGoToSetApiKey).toHaveBeenCalled();
	});

	// Test: Should render Set OpenAI Key button when error is INVALID_API_KEY
	it("renders Set OpenAI Key button when error is INVALID_API_KEY", () => {
		(useMailAnalysis as Mock).mockReturnValue({
			uploading: false,
			error: ErrorMessages.INVALID_API_KEY,
			analyzeEmail: mockAnalyzeEmail,
			reset: mockReset,
			goToSetApiKey: mockGoToSetApiKey,
		});
		render(<Home />);
		expect(screen.getByText("Set OpenAI Key")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Set OpenAI Key"));
		expect(mockGoToSetApiKey).toHaveBeenCalled();
	});
});
