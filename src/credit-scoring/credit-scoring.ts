import { SubmitApplicationData } from '../submit-application/submit-application.types';
import {
  CreditScoringInput,
  CreditScoreResult,
  RiskLevel,
} from './credit-scoring.types';

type LoanApplicationSubmittedEvent = {
  detail: SubmitApplicationData;
};

// Goal of this Lambda:
// This function receives a LoanApplicationSubmitted event from EventBridge.
// It reads the application data, validates it, calculates a credit score,
// and prepares a credit score result.
function toCreditScoringInput(
  application: SubmitApplicationData,
): CreditScoringInput {
  return {
    applicationId: application.applicationId,
    loanAmount: application.loanAmount,
    loanTermMonths: application.loanTermMonths,
    monthlyCashflow: application.monthlyCashflow,
    existingDebt: application.existingDebt,
  };
}

function calculateCreditScore(input: CreditScoringInput): CreditScoreResult {
  let score = 100;
  const reasons: string[] = [];


  const riskLevel: RiskLevel =
    score >= 75 ? 'LOW' : score >= 50 ? 'MEDIUM' : 'HIGH';

  return {
    applicationId: input.applicationId,
    score,
    riskLevel,
    calculatedAt: new Date().toISOString(),
    reasons,
  };
}

export const handler = async (event: LoanApplicationSubmittedEvent) => {
  const application = event.detail;

  const input = toCreditScoringInput(application);

  const result = calculateCreditScore(input);

  console.log('Credit score calculated', result);
};