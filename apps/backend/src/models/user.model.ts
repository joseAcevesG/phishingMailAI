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
});

export default model("User", userSchema);
