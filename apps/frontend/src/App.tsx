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
import ApiKeyForm from "./pages/settings/settings";
import SignUp from "./pages/SignUp/SignUp";

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
								<Landing />
							)
						}
						path="/"
					/>
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
								<ApiKeyForm />
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
						element={isAuthenticated ? <Navigate replace to="/" /> : <Login />}
						path="/login"
					/>
					<Route
						element={isAuthenticated ? <Navigate replace to="/" /> : <SignUp />}
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
