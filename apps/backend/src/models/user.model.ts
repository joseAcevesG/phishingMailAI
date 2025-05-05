import { Schema, model } from "mongoose";

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	api_key: {
		type: String,
	},
	freeTrial: {
		type: Boolean,
		default: true,
	},
	usageFreeTrial: {
		type: Number,
		default: 0,
	},
	token_version: {
		type: Number,
		default: 0,
	},
	analysis: [
		{
			_id: { type: String, required: true },
			phishingProbability: { type: Number, required: true },
			reasons: { type: String, required: true },
			redFlags: { type: [String], required: true },
			subject: { type: String, required: true },
			from: { type: String, required: true },
			to: { type: String, required: true },
		},
	],
});

export default model("User", userSchema);
