import { type Document, Schema, type Types, model } from "mongoose";

export interface IRefreshToken extends Document {
	user: Types.ObjectId;
	tokens: string[];
}

const refreshTokenSchema = new Schema<IRefreshToken>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		tokens: { type: [String], default: [] },
	},
	{ timestamps: true },
);

export default model<IRefreshToken>("RefreshToken", refreshTokenSchema);
