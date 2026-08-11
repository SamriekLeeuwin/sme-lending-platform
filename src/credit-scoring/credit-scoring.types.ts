export interface CreditScoringInput {
  applicationId: string;
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
  reasons: string[];
}

// TODO: kijken of deze nog nodig is, anders weggooien
export interface ValidSubmission {}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
