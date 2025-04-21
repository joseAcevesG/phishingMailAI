import type { NextFunction, Response } from "express";
import { EnvConfig } from "../config/env.config";
import openai from "../config/openai";
import userModel from "../models/user.model";
import type { RequestUser } from "../types";
import { decrypt } from "../utils/encrypt-string";
import ResponseStatus from "../utils/response-codes";

export default (req: RequestUser, res: Response, next: NextFunction) => {
	if (req.user?.freeTrial) {
		if (req.user.usageFreeTrial >= EnvConfig().freeTrialLimit) {
			res
				.status(ResponseStatus.FORBIDDEN.code)
				.send("Free trial limit exceeded");
			return;
		}
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
				console.error(error);
				res
					.status(ResponseStatus.INTERNAL_SERVER_ERROR.code)
					.send(ResponseStatus.INTERNAL_SERVER_ERROR.message);
				return;
			});
		return;
	}
	if (!req.user?.api_key) {
		res.status(ResponseStatus.FORBIDDEN.code).send("Free trial limit exceeded");
		return;
	}
	decrypt(req.user.api_key)
		.then((apiKey) => {
			openai.changeApiKey(apiKey);
			next();
		})
		.catch((error) => {
			res
				.status(ResponseStatus.INTERNAL_SERVER_ERROR.code)
				.send(ResponseStatus.INTERNAL_SERVER_ERROR.message);
			console.error(error);
		});
};
