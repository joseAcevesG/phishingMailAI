import type { NextFunction, Request, Response } from "express";
import { EnvConfig } from "../config/env.config";
import openai from "../config/openai";
import userModel from "../models/user.model";
import { decrypt } from "../utils/encrypt-string";
import ResponseStatus from "../utils/response-codes";

/**
 * Middleware to handle free trial functionality.
 *
 * If the user is on a free trial, it checks if the user has exceeded the free trial limit.
 * If the user has exceeded the limit, it returns a 403 Forbidden response.
 * If the user has not exceeded the limit, it increments the user's usageFreeTrial field and saves the user.
 * It then calls the next middleware.
 *
 * If the user is not on a free trial, it checks if the user has an API key.
 * If the user does not have an API key, it returns a 403 Forbidden response.
 * If the user has an API key, it decrypts the API key and sets the OpenAI API key to the decrypted value.
 * It then calls the next middleware.
 *
 * If any errors occur during the above process, it returns a 500 Internal Server Error response.
 */
export default (req: Request, res: Response, next: NextFunction) => {
	if (req.user?.freeTrial) {
		if (req.user.usageFreeTrial >= EnvConfig().freeTrialLimit) {
			res.status(ResponseStatus.FORBIDDEN.code).json({
				message: "Free trial limit exceeded",
			});
			return;
		}

		// Increment the user's usageFreeTrial field and save the user
		req.user.usageFreeTrial += 1;
		userModel
			.updateOne(
				{ _id: req.user._id },
				{ usageFreeTrial: req.user.usageFreeTrial },
			)
			.then(() => {
				next();
				return;
			})
			.catch((error) => {
				res.status(ResponseStatus.INTERNAL_SERVER_ERROR.code).json({
					message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
				});
				if (EnvConfig().environment !== "test")
					console.error("Free trial error:", error);
				return;
			});
		return;
	}

	// If the user is not on a free trial
	if (!req.user?.api_key) {
		res.status(ResponseStatus.FORBIDDEN.code).json({
			message: "Free trial limit exceeded",
		});
		return;
	}

	// Decrypt the user's API key and set the OpenAI API key to the decrypted value
	decrypt(req.user.api_key)
		.then((apiKey) => {
			openai.changeApiKey(apiKey);
			next();
		})
		.catch((error) => {
			res.status(ResponseStatus.INTERNAL_SERVER_ERROR.code).json({
				message: ResponseStatus.INTERNAL_SERVER_ERROR.message,
			});
			if (EnvConfig().environment !== "test")
				console.error("Free trial error:", error);
		});
};
