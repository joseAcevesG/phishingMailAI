import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "html", "lcov"],
			exclude: ["node_modules/", "dist/"],
		},
	},
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "../../packages/shared/src"),
		},
	},
});
