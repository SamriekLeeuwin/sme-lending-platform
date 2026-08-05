import type { ValidationResult } from "../submit-application/submit-application.types";
import {
  CREDIT_SCORING_ERRORS,
  CreditScoringValidationError,
} from "./credit-scoring-error";
import type { CreditScoringInput } from "./credit-scoring.types";
export function validateSubmitCredits(
  input: CreditScoringInput,
): ValidationResult<CreditScoringValidationError> {
  const errors: CreditScoringValidationError[] = [];

  if (!input) {
    errors.push(CREDIT_SCORING_ERRORS.inputRequired);
    return { isValid: false, errors };
  }

  if (
    typeof input.applicationId !== "string" ||
    input.applicationId.trim() === ""
  ) {
    errors.push(CREDIT_SCORING_ERRORS.applicationIdRequired);
  }

  if (
    typeof input.existingDebt !== "number" ||
    Number.isNaN(input.existingDebt) ||
    input.existingDebt < 0
  ) {
    errors.push(CREDIT_SCORING_ERRORS.existingDebtInvalid);
  }

  if (
    typeof input.loanAmount !== "number" ||
    Number.isNaN(input.loanAmount) ||
    input.loanAmount <= 0
  ) {
    errors.push(CREDIT_SCORING_ERRORS.loanAmountInvalid);
  }

  if (
    typeof input.monthlyCashflow !== "number" ||
    Number.isNaN(input.monthlyCashflow)
  ) {
    errors.push(CREDIT_SCORING_ERRORS.monthlyCashflowInvalid);
  }

  if (
    typeof input.loanTermMonths !== "number" ||
    Number.isNaN(input.loanTermMonths) ||
    input.loanTermMonths <= 0
  ) {
    errors.push(CREDIT_SCORING_ERRORS.loanTermMonthsInvalid);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
