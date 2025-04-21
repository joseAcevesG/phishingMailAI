// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import React from "react";
import App from "./App";
const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
