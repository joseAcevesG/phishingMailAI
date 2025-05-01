/// <reference types="vitest" />
import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "../packages/shared/src"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/setupTests.ts",
		include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
		},
	},
});
