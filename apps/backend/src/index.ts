import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Request,
	type Response,
	type NextFunction,
} from "express";
import swaggerUi from "swagger-ui-express";
import { EnvConfig } from "./config/env.config";
import connectDB from "./config/mongoose";
import swaggerSpec from "./docs/swagger";
import routes from "./routes";

const app = express();
const PORT = EnvConfig().port;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api", routes);
// Swagger docs route
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("*", (_req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

app.use(
	(
		err: Error & { status?: number },
		_req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		const status = err.status || 500;
		res
			.status(status)
			.json({ message: err.message || "Internal Server Error" });
	},
);

// Start server after DB connection
const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		if (EnvConfig().environment !== "test")
			console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// only start server if not in test environment
if (process.env.NODE_ENV !== "test") {
	startServer();
}

export default app;
