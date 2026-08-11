export const CREDIT_SCORING_ERRORS = {
  inputRequired: "CREDIT_SCORING_INPUT_REQUIRED",
  applicationIdRequired: "CREDIT_SCORING_APPLICATION_ID_REQUIRED",
  existingDebtInvalid: "CREDIT_SCORING_EXISTING_DEBT_INVALID",
  loanAmountInvalid: "CREDIT_SCORING_LOAN_AMOUNT_INVALID",
  monthlyCashflowInvalid: "CREDIT_SCORING_MONTHLY_CASHFLOW_INVALID",
  loanTermMonthsInvalid: "CREDIT_SCORING_LOAN_TERM_MONTHS_INVALID",
} as const;

export const CREDIT_SCORING_ERROR_MESSAGES = {
  [CREDIT_SCORING_ERRORS.inputRequired]: "input is required",
  [CREDIT_SCORING_ERRORS.applicationIdRequired]: "applicationId is required",
  [CREDIT_SCORING_ERRORS.existingDebtInvalid]:
    "existingDebt must be a non-negative number",
  [CREDIT_SCORING_ERRORS.loanAmountInvalid]:
    "loanAmount must be a positive number",
  [CREDIT_SCORING_ERRORS.monthlyCashflowInvalid]:
    "monthlyCashflow must be a number",
  [CREDIT_SCORING_ERRORS.loanTermMonthsInvalid]:
    "loanTermMonths must be a positive number",
} as const;
export type CreditScoringValidationError =
  (typeof CREDIT_SCORING_ERRORS)[keyof typeof CREDIT_SCORING_ERRORS];

export type CreditScoringErrorCode =
  (typeof CREDIT_SCORING_ERRORS)[keyof typeof CREDIT_SCORING_ERRORS];
