import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import About from "./pages/About";
import Home from "./pages/Home";
import IdPage from "./pages/IdPage";
import "./App.css";

function App() {
	return (
		<Router>
			<div className="app-container">
				<nav>
					<ul>
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<Link to="/about">About</Link>
						</li>
						<li>
							<Link to="/123">Example ID Page</Link>
						</li>
					</ul>
				</nav>

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/:id" element={<IdPage />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
