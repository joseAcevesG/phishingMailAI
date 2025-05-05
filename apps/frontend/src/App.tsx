import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import styles from "./App.module.css";
import Footer from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import Analyze from "./pages/Analyze/Analyze";
import { Authenticate } from "./pages/Authenticate/Authenticate";
import HistoryPage from "./pages/History/History";
import Home from "./pages/Home/Home";
import { Landing } from "./pages/Landing/Landing";
import { Login } from "./pages/Login/Login";
import { ResetLink } from "./pages/ResetLink/ResetLink";
import { ResetPassword } from "./pages/ResetPassword/ResetPassword";
import SignUp from "./pages/SignUp/SignUp";
import SettingsPage from "./pages/Settings/Settings";

/**
 * The AppContent component renders the main application layout, including the header,
 * footer, and all routes defined within the application. It manages authentication
 * state to conditionally render protected routes and redirects unauthenticated users
 * to the appropriate pages.
 *
 * It uses the `useAuth` hook to handle authentication logic, including login, signup,
 * and user authentication, and displays a loading state while authentication status
 * is being determined.
 */
const AppContent: React.FC = () => {
	// Destructure authentication state and handlers from useAuth
	const {
		isAuthenticated,
		userEmail,
		loading,
		handleLogout,
		handleAuthenticate,
	} = useAuth();

	// If authentication state is still loading, show a loading spinner/message
	if (loading) {
		return (
			<div className={styles.loading}>
				<p>Loading...</p>
			</div>
		);
	}

	return (
		// Main application container
		<div className={styles.appContainer}>
			{/* Header displays user email and logout button if authenticated */}
			{<Header onLogout={handleLogout} userEmail={userEmail} />}
			<main className={styles.mainContent}>
				<Routes>
					{/* Root route: shows Home if authenticated, Landing otherwise */}
					<Route
						element={
							isAuthenticated ? (
								<ProtectedRoute isAuthenticated={isAuthenticated}>
									<Home />
								</ProtectedRoute>
							) : (
								<Landing isAuthenticated={isAuthenticated} />
							)
						}
						path="/"
					/>
					{/* Reset password link route (for requesting password reset) */}
					<Route element={<ResetLink />} path="/reset-password-link" />
					{/* Analyze route: protected, requires authentication */}
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<Analyze />
							</ProtectedRoute>
						}
						path="/analyze/:id"
					/>
					{/* Settings route: protected, requires authentication */}
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<SettingsPage />
							</ProtectedRoute>
						}
						path="/settings"
					/>
					{/* History route: protected, requires authentication */}
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<HistoryPage />
							</ProtectedRoute>
						}
						path="/history"
					/>
					{/* Login route: redirects to root if already authenticated, otherwise shows Login */}
					<Route
						element={
							isAuthenticated ? (
								<Navigate replace to="/" />
							) : (
								<Login onAuthenticate={handleAuthenticate} />
							)
						}
						path="/login"
					/>
					{/* Signup route: redirects to root if already authenticated, otherwise shows SignUp */}
					<Route
						element={
							isAuthenticated ? (
								<Navigate replace to="/" />
							) : (
								<SignUp onAuthenticate={handleAuthenticate} />
							)
						}
						path="/signup"
					/>
					{/* Authenticate route: redirects to root if already authenticated, otherwise shows Authenticate */}
					<Route
						element={
							isAuthenticated ? (
								<Navigate replace to="/" />
							) : (
								<Authenticate onAuthenticate={handleAuthenticate} />
							)
						}
						path="/authenticate"
					/>
					{/* Reset password route (for actually resetting password) */}
					<Route element={<ResetPassword />} path="/reset-password" />
				</Routes>
			</main>
			{/* Footer always shown */}
			<Footer />
		</div>
	);
};

const App: React.FC = () => {
	return (
		<Router>
			<AppContent />
		</Router>
	);
};

export default App;
