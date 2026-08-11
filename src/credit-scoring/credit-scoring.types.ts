export interface CreditScoringInput {
  applicationId: string;
  existingDebt: number;
  loanAmount: number;
  monthlyCashflow: number;
  loanTermMonths: number;
}

export interface CreditScoreResult {
  applicationId: string;
  score: number;
  riskLevel: RiskLevel;
  calculatedAt: string;
  reasons: string[];
}

export interface ValidSubmission {}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
