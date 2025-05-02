import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  it("renders children when authenticated", () => {
    render(
      <MemoryRouter>
        <ProtectedRoute isAuthenticated={true}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to /login when not authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <ProtectedRoute isAuthenticated={false}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    // Since <Navigate> doesn't render anything, check for absence of children
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
