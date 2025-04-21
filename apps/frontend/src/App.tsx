import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import styles from "./App.module.css";
import { Header } from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import ApiKeyForm from "./pages/settings/settings";
import { Authenticate } from "./pages/Authenticate/Authenticate";
import Home from "./pages/Home/Home";
import Analyze from "./pages/Analyze/Analyze";
import { Landing } from "./pages/Landing/Landing";
import { Login } from "./pages/Login/Login";
import HistoryPage from "./pages/History/History";

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
						path="/"
						element={
							isAuthenticated ? (
								<ProtectedRoute isAuthenticated={isAuthenticated}>
									<Home />
								</ProtectedRoute>
							) : (
								<Landing />
							)
						}
					/>
					<Route
						path="/analyze/:id"
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<Analyze />
							</ProtectedRoute>
						}
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
						path="/history"
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<HistoryPage />
							</ProtectedRoute>
						}
					/>
					<Route
						element={isAuthenticated ? <Navigate replace to="/" /> : <Login />}
						path="/login"
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
