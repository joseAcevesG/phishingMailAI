import { act, renderHook } from "@testing-library/react";
import type React from "react";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { useUploadForm } from "./useUploadForm";

// Helper to create a synthetic input change event for file inputs
function createInputChangeEvent(
	file: File,
): React.ChangeEvent<HTMLInputElement> {
	return {
		target: {
			files: [file],
		} as unknown as React.ChangeEvent<HTMLInputElement>["target"],
		currentTarget: {} as HTMLInputElement,
		bubbles: false,
		cancelable: false,
		defaultPrevented: false,
		eventPhase: 0,
		isTrusted: false,
		nativeEvent: {} as Event,
		preventDefault: () => {},
		stopPropagation: () => {},
		persist: () => {},
		type: "change",
		timeStamp: Date.now(),
	} as React.ChangeEvent<HTMLInputElement>;
}

describe("useUploadForm", () => {
	beforeAll(() => {
		// Mock DataTransfer for drag-and-drop tests
		// @ts-expect-error
		global.DataTransfer = class {
			files: File[] = [];
			items = {
				add: (file: File) => {
					this.files.push(file);
				},
			};
		};
	});
	afterAll(() => {
		// Cleanup DataTransfer mock
		// @ts-expect-error
		global.DataTransfer = undefined;
	});
	let onAnalyze: ReturnType<typeof vi.fn>;
	beforeEach(() => {
		onAnalyze = vi.fn().mockResolvedValue(undefined);
	});

	// Test: Initial state should be correct
	it("initial state is correct", () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		expect(result.current.file).toBe(null);
		expect(result.current.error).toBe(null);
		expect(result.current.dragActive).toBe(false);
		expect(result.current.inputRef.current).toBe(null);
	});

	// Test: Should set file and clear error for valid .eml file
	it("sets file and clears error for valid .eml file", () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
		act(() => {
			result.current.handleFileChange(createInputChangeEvent(file));
		});
		expect(result.current.file).toBe(file);
		expect(result.current.error).toBe(null);
	});

	// Test: Should set error and clear file for invalid file type
	it("sets error and clears file for invalid file type", () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		const file = new File(["dummy"], "bad.txt", { type: "text/plain" });
		act(() => {
			result.current.handleFileChange(createInputChangeEvent(file));
		});
		expect(result.current.file).toBe(null);
		expect(result.current.error).toMatch(/valid .eml file/i);
	});

	// Test: Should handle drag over and drag leave events
	it("handles drag over and drag leave", () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		const dragEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
		} as unknown as React.DragEvent<HTMLLabelElement>;
		act(() => {
			result.current.handleDragOver(dragEvent);
		});
		expect(result.current.dragActive).toBe(true);
		act(() => {
			result.current.handleDragLeave(dragEvent);
		});
		expect(result.current.dragActive).toBe(false);
	});

	// Test: Should handle drop with a valid file
	it("handles drop with valid file", () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
		result.current.inputRef.current = {
			files: null,
		} as unknown as HTMLInputElement;
		const dropEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as React.DragEvent<HTMLLabelElement>;
		act(() => {
			result.current.handleDrop(dropEvent);
		});
		expect(result.current.file).toBe(file);
		expect(result.current.error).toBe(null);
	});

	// Test: Should handle drop with an invalid file
	it("handles drop with invalid file", () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		const file = new File(["dummy"], "bad.txt", { type: "text/plain" });
		const dropEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as React.DragEvent<HTMLLabelElement>;
		act(() => {
			result.current.handleDrop(dropEvent);
		});
		expect(result.current.file).toBe(null);
		expect(result.current.error).toMatch(/valid .eml file/i);
	});

	// Test: Should call onAnalyze and reset file on successful submit
	it("calls onAnalyze and resets file on successful submit", async () => {
		const { result } = renderHook(() => useUploadForm(onAnalyze));
		const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
		act(() => {
			result.current.setFile(file);
		});
		const submitEvent = {
			preventDefault: vi.fn(),
		} as unknown as React.FormEvent;
		await act(async () => {
			await result.current.handleSubmit(submitEvent);
		});
		expect(onAnalyze).toHaveBeenCalledWith(file);
		expect(result.current.file).toBe(null);
	});

	// Test: Should set error on analyze failure
	it("sets error on analyze failure", async () => {
		const failingAnalyze = vi.fn().mockRejectedValue(new Error("fail!"));
		const { result } = renderHook(() => useUploadForm(failingAnalyze));
		const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
		act(() => {
			result.current.setFile(file);
		});
		const submitEvent = {
			preventDefault: vi.fn(),
		} as unknown as React.FormEvent;
		await act(async () => {
			await result.current.handleSubmit(submitEvent);
		});
		expect(result.current.error).toMatch(/fail!/i);
	});
});
