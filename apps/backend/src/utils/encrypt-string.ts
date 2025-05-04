import crypto from "node:crypto";
import { EnvConfig } from "../config/env.config";
import { EncryptError } from "./errors";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

/**
 * Encrypts a plain text string using AES-256-CBC encryption algorithm.
 *
 * The function uses a secret key and salt from the environment configuration
 * to derive a cryptographic key. It generates a random initialization vector (IV)
 * for each encryption operation to ensure unique ciphertexts for identical inputs.
 *
 * The encryption process converts the input text from UTF-8 to hexadecimal format.
 * The resulting encrypted text is prepended with the IV in hexadecimal format,
 * separated by a colon.
 *
 * @param text - The plain text string to be encrypted.
 * @returns A promise that resolves to the encrypted string in the format "iv:encryptedText".
 * @throws Will reject the promise if there is an error during the key derivation or encryption process.
 */
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

/**
 * Decrypts a ciphertext string using AES-256-CBC decryption algorithm.
 *
 * The function uses the same secret key and salt from the environment configuration
 * as the encryption function to derive a cryptographic key. It expects the input
 * ciphertext to be in the format "iv:encryptedText", where "iv" is the initialization
 * vector in hexadecimal format, and "encryptedText" is the actual ciphertext.
 *
 * The decryption process converts the input ciphertext from hexadecimal to UTF-8 format.
 *
 * @param encryptedText - The ciphertext string to be decrypted.
 * @returns A promise that resolves to the decrypted string in UTF-8 format.
 * @throws Will reject the promise if there is an error during the key derivation or decryption process.
 */
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
