import crypto from "node:crypto";
import { EnvConfig } from "../config/env.config";
import { EncryptError } from "./errors";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export function encrypt(text: string): Promise<string> {
	return new Promise((resolve, reject) => {
		crypto.scrypt(EnvConfig().secretKey, EnvConfig().salt, 32, (err, key) => {
			if (err) reject(err);
			try {
				const iv = crypto.randomBytes(IV_LENGTH);
				const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

				let encrypted = cipher.update(text, "utf8", "hex");
				encrypted += cipher.final("hex");

				resolve(`${iv.toString("hex")}:${encrypted}`);
			} catch (error) {
				reject(error);
			}
		});
	});
}

export function decrypt(encryptedText: string): Promise<string> {
	return new Promise((resolve, reject) => {
		crypto.scrypt(EnvConfig().secretKey, EnvConfig().salt, 32, (err, key) => {
			if (err) reject(err);
			try {
				const [ivHex, encrypted] = encryptedText.split(":");
				if (!(ivHex && encrypted)) {
					throw new EncryptError("Invalid encrypted text format");
				}

				const iv = Buffer.from(ivHex, "hex");
				const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

				let decrypted = decipher.update(encrypted, "hex", "utf8");
				decrypted += decipher.final("utf8");

				resolve(decrypted);
			} catch (error) {
				reject(error);
			}
		});
	});
}
