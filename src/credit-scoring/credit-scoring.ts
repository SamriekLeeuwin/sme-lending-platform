import { SubmitApplicationData } from "../submit-application/submit-application.types";
import {
  CreditScoringInput,
  CreditScoreResult,
  RiskLevel,
} from "./credit-scoring.types";
import { validateSubmitCredits } from "./validate.submit.credits";

type LoanApplicationSubmittedEvent = {
  detail: SubmitApplicationData;
};

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
  const reasons: string[] = [];

  // TODO: score regels nog even checken met opdracht, vooral de grenzen en weging
  const monthlyDebtService = input.loanAmount / input.loanTermMonths;
  const dscr = input.monthlyCashflow / monthlyDebtService;

  let dscrScore = 0;
  if (dscr >= 2.0) {
    dscrScore = 30;
  } else if (dscr >= 1.5) {
    dscrScore = 25;
  } else if (dscr >= 1.25) {
    dscrScore = 20;
  } else if (dscr >= 1.0) {
    dscrScore = 10;
  } else {
    dscrScore = 0;
  }
  reasons.push(`DSCR score: ${dscrScore}/30`);

  let debtToRevenueScore = 0;
  if (input.monthlyCashflow <= 0) {
    debtToRevenueScore = 0;
  } else {
    const debtToRevenueRatio =
      (input.existingDebt / input.monthlyCashflow) * 100;
    if (debtToRevenueRatio <= 20) {
      debtToRevenueScore = 20;
    } else if (debtToRevenueRatio <= 35) {
      debtToRevenueScore = 16;
    } else if (debtToRevenueRatio <= 50) {
      debtToRevenueScore = 12;
    } else if (debtToRevenueRatio <= 70) {
      debtToRevenueScore = 6;
    } else {
      debtToRevenueScore = 0;
    }
  }
  reasons.push(`Debt-to-revenue score: ${debtToRevenueScore}/20`);

  let loanToRevenueScore = 0;
  if (input.monthlyCashflow <= 0) {
    loanToRevenueScore = 0;
  } else {
    const loanToRevenueRatio = (input.loanAmount / input.monthlyCashflow) * 100;
    if (loanToRevenueRatio <= 10) {
      loanToRevenueScore = 20;
    } else if (loanToRevenueRatio <= 20) {
      loanToRevenueScore = 16;
    } else if (loanToRevenueRatio <= 30) {
      loanToRevenueScore = 12;
    } else if (loanToRevenueRatio <= 50) {
      loanToRevenueScore = 6;
    } else {
      loanToRevenueScore = 0;
    }
  }
  reasons.push(`Loan-to-revenue score: ${loanToRevenueScore}/20`);

  let cashflowMarginScore = 0;
  if (input.loanAmount <= 0) {
    cashflowMarginScore = 0;
  } else {
    const cashflowMarginRatio =
      (input.monthlyCashflow / input.loanAmount) * 100;
    if (cashflowMarginRatio >= 20) {
      cashflowMarginScore = 20;
    } else if (cashflowMarginRatio >= 15) {
      cashflowMarginScore = 16;
    } else if (cashflowMarginRatio >= 10) {
      cashflowMarginScore = 12;
    } else if (cashflowMarginRatio >= 5) {
      cashflowMarginScore = 6;
    } else {
      cashflowMarginScore = 0;
    }
  }
  reasons.push(`Cashflow margin score: ${cashflowMarginScore}/20`);

  let businessHistoryScore = 0;
  if (input.loanTermMonths >= 60) {
    businessHistoryScore = 10;
  } else if (input.loanTermMonths >= 36) {
    businessHistoryScore = 8;
  } else if (input.loanTermMonths >= 24) {
    businessHistoryScore = 6;
  } else if (input.loanTermMonths >= 12) {
    businessHistoryScore = 3;
  } else {
    businessHistoryScore = 0;
  }
  reasons.push(`Business history score: ${businessHistoryScore}/10`);

  const totalScore =
    dscrScore * 0.3 +
    debtToRevenueScore * 0.2 +
    loanToRevenueScore * 0.2 +
    cashflowMarginScore * 0.2 +
    businessHistoryScore * 0.1;

  const score = Math.round(totalScore);
  const riskLevel: RiskLevel =
    score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH";

  return {
    applicationId: input.applicationId,
    score,
    riskLevel,
    calculatedAt: new Date().toISOString(),
    reasons,
  };
}

export const handler = async (event: LoanApplicationSubmittedEvent) => {
  // TODO: event.detail nog valideren, anders crasht dit als event verkeerd binnenkomt
  const application = event.detail;
  const input = toCreditScoringInput(application);

  const validation = validateSubmitCredits(input);
  if (!validation.isValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: validation.errors }),
    };
  }

  const result = calculateCreditScore(input);

  // TODO: score nog ergens opslaan of doorsturen, anders blijft hij alleen in deze response
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
