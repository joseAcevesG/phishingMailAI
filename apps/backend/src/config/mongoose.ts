import mongoose from "mongoose";
import { EnvConfig } from "./env.config";

/**
 * Connects to the MongoDB database based on the environment variable
 * `DB_URL`. If the connection is successful, logs a success message to
 * the console. If the connection fails, logs an error message to the
 * console and exits the process with a status code of 1.
 */
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
