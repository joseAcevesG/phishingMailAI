import { useCallback, useEffect, useState } from "react";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
	useNavigate,
} from "react-router-dom";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Authenticate } from "./pages/Authenticate";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import "./App.css";

const AppContent = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			if (response.ok) {
				setIsAuthenticated(false);
				setUserEmail(null);
				navigate("/login");
				return;
			}
			console.error("Logout failed");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleAuthenticate = useCallback(
		async (data: { authenticated: boolean; email: string }) => {
			setIsAuthenticated(data.authenticated);
			setUserEmail(data.email);
		},
		[]
	);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/status", {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setIsAuthenticated(data.authenticated);
					setUserEmail(data.email);
				} else {
					setIsAuthenticated(false);
					setUserEmail(null);
				}
			} catch (error) {
				console.error("Auth check failed:", error);
				setIsAuthenticated(false);
				setUserEmail(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

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
								<Login isAuthenticated={isAuthenticated} />
							)
						}
						path="/login"
					/>
					<Route
						element={<Authenticate onAuthenticate={handleAuthenticate} />}
						path="/authenticate"
					/>
					<Route element={<Navigate replace to="/" />} path="*" />
				</Routes>
			</main>
		</div>
	);
};

function App() {
	return (
		<Router>
			<AppContent />
		</Router>
	);
}

export default App;
