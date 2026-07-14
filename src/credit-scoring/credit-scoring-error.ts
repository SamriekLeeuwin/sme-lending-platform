export const CREDIT_SCORING_ERRORS = {
  inputRequired: 'input is required',
  applicationIdRequired: 'applicationId is required',
  existingDebtInvalid: 'existingDebt must be a non-negative number',
  loanAmountInvalid: 'loanAmount must be a positive number',
  monthlyCashflowInvalid: 'monthlyCashflow must be a number',
  loanTermMonthsInvalid: 'loanTermMonths must be a positive number',
} as const;

export type CreditScoringValidationError =
  (typeof CREDIT_SCORING_ERRORS)[keyof typeof CREDIT_SCORING_ERRORS];