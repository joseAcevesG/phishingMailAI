import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { useMailAnalysis } from "./useMailAnalysis";
import { useFetch } from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import type { Analysis } from "shared";

vi.mock("../../hooks/useFetch", () => ({
  useFetch: vi.fn(),
}));
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

const mockUseFetch = useFetch as unknown as Mock;
const mockUseNavigate = useNavigate as unknown as Mock;

describe("useMailAnalysis", () => {
  const fakeAnalysis: Analysis = {
    _id: "abc123",
    subject: "Test Subject",
    from: "a@b.com",
    to: "b@c.com",
    phishingProbability: 0.5,
    reasons: "Test reason",
    redFlags: ["flag1"],
  };

  let executeMock: Mock;
  let navigateMock: Mock;

  beforeEach(() => {
    executeMock = vi.fn();
    navigateMock = vi.fn();
    mockUseFetch.mockReturnValue({
      execute: executeMock,
      error: null,
      loading: false,
    });
    mockUseNavigate.mockReturnValue(navigateMock);
  });

  it("returns uploading, error, and functions", () => {
    const { result } = renderHook(() => useMailAnalysis());
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.analyzeEmail).toBe("function");
    expect(typeof result.current.reset).toBe("function");
    expect(typeof result.current.goToSetApiKey).toBe("function");
  });

  it("calls execute and navigates on analyzeEmail", async () => {
    executeMock.mockResolvedValue(fakeAnalysis);
    const { result } = renderHook(() => useMailAnalysis());
    const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
    await act(async () => {
      await result.current.analyzeEmail(file);
    });
    expect(executeMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(`/analyze/${fakeAnalysis._id}`);
  });

  it("does not navigate if execute returns null", async () => {
    executeMock.mockResolvedValue(null);
    const { result } = renderHook(() => useMailAnalysis());
    const file = new File(["dummy"], "test.eml", { type: "message/rfc822" });
    await act(async () => {
      await result.current.analyzeEmail(file);
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("sets error when errorFetch changes", () => {
    mockUseFetch.mockReturnValue({
      execute: executeMock,
      error: "Some error",
      loading: false,
    });
    const { result } = renderHook(() => useMailAnalysis());
    expect(result.current.error).toBe("Some error");
  });

  it("reset clears error", () => {
    mockUseFetch.mockReturnValue({
      execute: executeMock,
      error: "Some error",
      loading: false,
    });
    const { result } = renderHook(() => useMailAnalysis());
    act(() => {
      result.current.reset();
    });
    expect(result.current.error).toBe(null);
  });

  it("goToSetApiKey navigates to /settings", () => {
    const { result } = renderHook(() => useMailAnalysis());
    act(() => {
      result.current.goToSetApiKey();
    });
    expect(navigateMock).toHaveBeenCalledWith("/settings");
  });
});
