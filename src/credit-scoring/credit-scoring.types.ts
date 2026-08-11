export interface CreditScoringInput {
  applicationId: string;
  // TODO: bedragen later ook hier in centen gebruiken net als bij submit input
  existingDebt: number;
  loanAmount: number;
  monthlyCashflow: number;
  loanTermMonths: number;
}

export interface CreditScoreResult {
  applicationId: string;
  // TODO: nog testen of score altijd netjes binnen 0-100 blijft
  score: number;
  riskLevel: RiskLevel;
  calculatedAt: string;
  // TODO: rulesetVersion toevoegen voor audit/uitleg achteraf
  reasons: string[];
}

// TODO: kijken of deze nog nodig is, anders weggooien
export interface ValidSubmission {}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
