import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import styles from "./App.module.css";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import ApiKeyForm from "./pages/ApiKeyForm";
import { Authenticate } from "./pages/Authenticate";
import Home from "./pages/Home";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";

const AppContent = () => {
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
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<ApiKeyForm />
							</ProtectedRoute>
						}
						path="/set-api-key"
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
		</div>
	);
};

const App = () => {
	return (
		<Router>
			<AppContent />
		</Router>
	);
};

export default App;
