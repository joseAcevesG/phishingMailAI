import OpenAI from "openai";
import { EnvConfig } from "./env.config";

// The SYSTEM_PROMPT is the text that is sent to the OpenAI model to analyze the email content.
const SYSTEM_PROMPT = `You are a cybersecurity expert specialized in identifying phishing emails. 
Analyze the provided email content and determine the likelihood that it's a phishing attempt.
Consider factors such as:
- Urgency or pressure tactics
- Suspicious sender addresses
- Grammar and spelling errors
- Requests for sensitive information
- Suspicious links or attachments
- Inconsistencies in branding or formatting

Provide your analysis in JSON format with the following structure:
{
  "phishingProbability": number, // 0 to 1, where 1 means definitely phishing
  "reasons": string, // Detailed explanation of why you assigned this probability
  "redFlags": string[] // List of specific suspicious elements found
}`;

/**
 * A class that encapsulates the OpenAI instance and provides methods
 * to change the API key used to initialize the instance.
 *
 * The class is initialized with the API key from the EnvConfig.
 *
 * The SYSTEM_PROMPT property is a string that contains the prompt
 * that is sent to the OpenAI model to analyze the email content.
 *
 * The changeApiKey method takes an API key as an argument and updates
 * the OpenAI instance with the new API key.
 */
class OpenAIConfig {
	openai: OpenAI;
	SYSTEM_PROMPT: string;

	/**
	 * Initializes the OpenAI instance with the API key from the EnvConfig
	 * and sets the SYSTEM_PROMPT property to the constant string defined above.
	 */
	constructor() {
		this.openai = new OpenAI({
			apiKey: EnvConfig().openai.apiKey,
		});
		this.SYSTEM_PROMPT = SYSTEM_PROMPT;
	}

	/**
	 * Updates the OpenAI instance with the provided API key.
	 *
	 * This method is useful when you need to change the API key used to initialize the OpenAI instance.
	 * For example, if the user is using a free trial and wants to upgrade to a paid plan,
	 * you can call this method with the new API key to update the OpenAI instance.
	 *
	 * @param apiKey The new API key to use for the OpenAI instance.
	 */
	changeApiKey(apiKey: string) {
		this.openai = new OpenAI({
			apiKey,
		});
	}
}

export default new OpenAIConfig();
export { OpenAIConfig };
