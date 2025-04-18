export interface Analysis {
	_id: string;
	subject: string;
	from: string;
	to: string;
	phishingProbability: number;
	reasons: string;
	redFlags: string[];
}
