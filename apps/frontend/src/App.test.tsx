import { describe, it, expect, vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { useAuth } from "./hooks/useAuth";

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
	Landing: () => <div data-testid="landing" />,
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

describe("App routing and layout", () => {
	it("renders loading state", () => {
		setupAuthMock({ loading: true });
		render(<App />);
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it("renders header and footer", () => {
		setupAuthMock({});
		render(<App />);
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("shows Landing on root route if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/");
		render(<App />);
		expect(screen.getByTestId("landing")).toBeInTheDocument();
	});

	it("shows Home on root route if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/");
		render(<App />);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	it("shows Login on /login if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/login");
		render(<App />);
		expect(screen.getByTestId("login")).toBeInTheDocument();
	});

	it("redirects to root on /login if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/login");
		render(<App />);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	it("shows SignUp on /signup if not authenticated", () => {
		setupAuthMock({ isAuthenticated: false });
		window.history.pushState({}, "", "/signup");
		render(<App />);
		expect(screen.getByTestId("signup")).toBeInTheDocument();
	});

	it("shows SettingsPage on /settings if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/settings");
		render(<App />);
		expect(screen.getByTestId("settings")).toBeInTheDocument();
	});

	it("shows HistoryPage on /history if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/history");
		render(<App />);
		expect(screen.getByTestId("history")).toBeInTheDocument();
	});

	it("shows Analyze on /analyze/:id if authenticated", () => {
		setupAuthMock({ isAuthenticated: true });
		window.history.pushState({}, "", "/analyze/123");
		render(<App />);
		expect(screen.getByTestId("analyze")).toBeInTheDocument();
	});

	it("shows ResetLink on /reset-password-link", () => {
		setupAuthMock({});
		window.history.pushState({}, "", "/reset-password-link");
		render(<App />);
		expect(screen.getByTestId("reset-link")).toBeInTheDocument();
	});

	it("shows ResetPassword on /reset-password", () => {
		setupAuthMock({});
		window.history.pushState({}, "", "/reset-password");
		render(<App />);
		expect(screen.getByTestId("reset-password")).toBeInTheDocument();
	});
});
