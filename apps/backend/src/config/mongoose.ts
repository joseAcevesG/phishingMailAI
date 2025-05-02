import dotenv from "dotenv";
import mongoose from "mongoose";
import { EnvConfig } from "./env.config";

dotenv.config();

const connectDB = async (): Promise<void> => {
	try {
		const dbUrl = EnvConfig().dbUrl;

		await mongoose.connect(dbUrl);
		console.log("MongoDB connected successfully");
	} catch (error) {
		if (EnvConfig().environment !== "test")
			console.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

export default connectDB;
