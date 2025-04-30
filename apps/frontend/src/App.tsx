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
import SettingsPage from "./pages/settings/settings";
import SignUp from "./pages/SignUp/SignUp";
import { ResetLink } from "./pages/ResetLink/ResetLink";
import { ResetPassword } from "./pages/ResetPassword/ResetPassword";

const AppContent: React.FC = () => {
	const {
		isAuthenticated,
		userEmail,
		loading,
		handleLogout,
		handleAuthenticate,
	} = useAuth();

	if (loading) {
		return (
			<div className={styles.loading}>
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className={styles.appContainer}>
			{<Header onLogout={handleLogout} userEmail={userEmail} />}
			<main className={styles.mainContent}>
				<Routes>
					{/* root route */}
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
					{/* reset password route */}
					<Route element={<ResetLink />} path="/reset-password-link" />
					{/* analyze route */}
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<Analyze />
							</ProtectedRoute>
						}
						path="/analyze/:id"
					/>
					{/* settings route */}
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<SettingsPage />
							</ProtectedRoute>
						}
						path="/settings"
					/>
					{/* history route */}
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<HistoryPage />
							</ProtectedRoute>
						}
						path="/history"
					/>
					{/* login route */}
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
					{/* signup route */}
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
					{/* authenticate route */}
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
					{/* reset password route */}
					<Route element={<ResetPassword />} path="/reset-password" />
				</Routes>
			</main>
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
