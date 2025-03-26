import OpenAI from "openai";
import { EnvConfig } from "./env.config";

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

class OpenAIConfig {
	openai: OpenAI;
	SYSTEM_PROMPT: string;

	constructor() {
		this.openai = new OpenAI({
			apiKey: EnvConfig().openai.apiKey,
		});
		this.SYSTEM_PROMPT = SYSTEM_PROMPT;
	}

	changeApiKey(apiKey: string) {
		this.openai = new OpenAI({
			apiKey,
		});
	}
}

export default new OpenAIConfig();
