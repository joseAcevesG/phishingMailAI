import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Authenticate } from "./pages/Authenticate";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

const AppContent = () => {
	const { isAuthenticated, userEmail, loading, handleLogout, handleAuthenticate } = useAuth();

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="app-container">
			<Header onLogout={handleLogout} userEmail={userEmail} />
			<main className="main-content">
				<Routes>
					<Route
						element={
							<ProtectedRoute isAuthenticated={isAuthenticated}>
								<Home />
							</ProtectedRoute>
						}
						path="/"
					/>
					<Route
						element={
							isAuthenticated ? (
								<Navigate replace to="/" />
							) : (
								<Login />
							)
						}
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
