import { useEffect, useState } from "react";
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
import { Result } from "./pages/Result";
import "./App.css";

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch('/api/auth/status');
				if (response.ok) {
					const data = await response.json();
					setIsAuthenticated(data.authenticated);
					setUserEmail(data.email);
				} else {
					setIsAuthenticated(false);
					setUserEmail(undefined);
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				setIsAuthenticated(false);
				setUserEmail(undefined);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	const handleLogin = async () => {
		window.location.href = '/api/auth/login';
	};

	const handleLogout = async () => {
		try {
			const response = await fetch('/api/auth/logout', { 
				method: 'POST',
				credentials: 'include' // This is important for cookies
			});
			
			if (response.ok) {
				setIsAuthenticated(false);
				setUserEmail(undefined);
				window.location.href = '/login';
			} else {
				console.error('Logout failed');
			}
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	if (loading) {
		return <div className="loading">Loading...</div>;
	}

	return (
		<Router>
			<div className="app-container">
				<Header userEmail={userEmail || null} onLogout={handleLogout} />

				<main className="main-content">
					<Routes>
						<Route
							path="/login"
							element={
								<Login
									onLogin={handleLogin}
									isAuthenticated={isAuthenticated}
								/>
							}
						/>
						<Route path="/authenticate" element={<Authenticate />} />
						<Route
							path="/"
							element={
								<ProtectedRoute isAuthenticated={isAuthenticated}>
									<Home />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/result"
							element={
								<ProtectedRoute isAuthenticated={isAuthenticated}>
									<Result />
								</ProtectedRoute>
							}
						/>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
