import path from "node:path";
import express, { type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("/api/", (_req: Request, res: Response) => {
	res.json({ name: "test monorepo" });
});

app.get("*", (_req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
