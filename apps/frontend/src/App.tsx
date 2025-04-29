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
import Analyze from "./components/pages/Analyze/Analyze";
import { Authenticate } from "./components/pages/Authenticate/Authenticate";
import HistoryPage from "./components/pages/History/History";
import Home from "./components/pages/Home/Home";
import { Landing } from "./components/pages/Landing/Landing";
import { Login } from "./components/pages/Login/Login";
import SettingsPage from "./components/pages/settings/settings";
import SignUp from "./components/pages/SignUp/SignUp";
import { ResetLink } from "./components/pages/ResetLink/ResetLink";
import { ResetPassword } from "./components/pages/ResetPassword/ResetPassword";

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
					<Route element={<ResetLink />} path="/reset-password-link" />
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<Analyze />
							</ProtectedRoute>
						}
						path="/analyze/:id"
					/>
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<SettingsPage />
							</ProtectedRoute>
						}
						path="/settings"
					/>
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<HistoryPage />
							</ProtectedRoute>
						}
						path="/history"
					/>
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
