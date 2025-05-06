import { render, screen } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";
import App from "./App";
import { useAuth } from "./hooks/useAuth";

// Mock all major page and layout components to isolate routing and layout logic
vi.mock("./components/Header/Header", () => ({
	Header: () => <div data-testid="header" />,
}));
vi.mock("./components/Footer/Footer", () => ({
	default: () => <div data-testid="footer" />,
}));
vi.mock("./components/ProtectedRoute/ProtectedRoute", () => ({
	ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));
vi.mock("./pages/Analyze/Analyze", () => ({
	default: () => <div data-testid="analyze" />,
}));
vi.mock("./pages/Authenticate/Authenticate", () => ({
	Authenticate: () => <div data-testid="authenticate" />,
}));
vi.mock("./pages/History/History", () => ({
	default: () => <div data-testid="history" />,
}));
vi.mock("./pages/Home/Home", () => ({
	default: () => <div data-testid="home" />,
}));
vi.mock("./pages/Landing/Landing", () => ({
	default: () => <div data-testid="landing" />,
}));
vi.mock("./pages/Login/Login", () => ({
	Login: () => <div data-testid="login" />,
}));
vi.mock("./pages/ResetLink/ResetLink", () => ({
	ResetLink: () => <div data-testid="reset-link" />,
}));
vi.mock("./pages/ResetPassword/ResetPassword", () => ({
	ResetPassword: () => <div data-testid="reset-password" />,
}));
vi.mock("./pages/SignUp/SignUp", () => ({
	default: () => <div data-testid="signup" />,
}));
vi.mock("./pages/Settings/Settings", () => ({
	default: () => <div data-testid="settings" />,
}));

vi.mock("./hooks/useAuth", () => ({
	useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as unknown as Mock;

// Helper to set up the mocked useAuth return value for each test
function setupAuthMock(overrides: Partial<ReturnType<typeof useAuth>>) {
	mockUseAuth.mockReturnValue({
		isAuthenticated: false,
		userEmail: null,
		loading: false,
		handleLogout: vi.fn(),
		handleAuthenticate: vi.fn(),
		...overrides,
	});
}

// Test suite for routing and layout of the App component
// Each test sets up the authentication state and simulates navigation

describe("App routing and layout", () => {
	// Test: Should show loading state when auth is loading
	it("renders loading state", () => {
		setupAuthMock({ loading: true });
		render(<App />);
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	// Test: Should render header and footer on all pages
	it("renders header and footer", () => {
		setupAuthMock({});
		render(<App />);
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	// Test: Should show Landing page on root route if not authenticated
	it("shows Landing on root route if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/");
		render(<App />);
		expect(screen.getByTestId("landing")).toBeInTheDocument();
	});

	// Test: Should show Home page on root route if authenticated
	it("shows Home on root route if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/");
		render(<App />);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	// Test: Should show Authenticate page on /authenticate if not authenticated
	it("shows Authenticate on /authenticate if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/authenticate");
		render(<App />);
		expect(screen.getByTestId("authenticate")).toBeInTheDocument();
	});

	// Test: Should redirect to root on /authenticate if authenticated
	it("redirects to root on /authenticate if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/authenticate");
		render(<App />);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	// Test: Should show Login page on /login if not authenticated
	it("shows Login on /login if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/login");
		render(<App />);
		expect(screen.getByTestId("login")).toBeInTheDocument();
	});

	// Test: Should redirect to root on /login if authenticated
	it("redirects to root on /login if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/login");
		render(<App />);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	// Test: Should show SignUp page on /signup if not authenticated
	it("shows SignUp on /signup if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/signup");
		render(<App />);
		expect(screen.getByTestId("signup")).toBeInTheDocument();
	});

	// Test: Should redirect to root on /signup if authenticated
	it("redirects to root on /signup if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/signup");
		render(<App />);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	// Test: Should show Settings page on /settings if authenticated
	it("shows SettingsPage on /settings if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/settings");
		render(<App />);
		expect(screen.getByTestId("settings")).toBeInTheDocument();
	});

	// Test: Should show History page on /history if authenticated
	it("shows HistoryPage on /history if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/history");
		render(<App />);
		expect(screen.getByTestId("history")).toBeInTheDocument();
	});

	// Test: Should show Analyze page on /analyze/:id if authenticated
	it("shows Analyze on /analyze/:id if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/analyze/123");
		render(<App />);
		expect(screen.getByTestId("analyze")).toBeInTheDocument();
	});

	// Test: Should show ResetLink page on /reset-password-link
	it("shows ResetLink on /reset-password-link", () => {
		setupAuthMock({});
		window.history.pushState({}, "", "/reset-password-link");
		render(<App />);
		expect(screen.getByTestId("reset-link")).toBeInTheDocument();
	});

	// Test: Should show ResetPassword page on /reset-password
	it("shows ResetPassword on /reset-password", () => {
		setupAuthMock({});
		window.history.pushState({}, "", "/reset-password");
		render(<App />);
		expect(screen.getByTestId("reset-password")).toBeInTheDocument();
	});
});
