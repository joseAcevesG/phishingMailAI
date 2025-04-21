import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { EnvConfig } from "./config/env.config";
import connectDB from "./config/mongoose";
import routes from "./routes";

const app = express();
const PORT = EnvConfig().port;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api", routes);

app.get("*", (_req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

// Start server after DB connection
const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
	startServer();
}

export default app;
