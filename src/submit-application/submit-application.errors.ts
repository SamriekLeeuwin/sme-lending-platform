export const SUBMIT_APPLICATION_ERRORS = {
  inputRequired: 'input is required',
  applicantNameRequired: 'applicantName is required',
  companyNameRequired: 'companyName is required',
  emailRequired: 'email is required',
  loanPurposeRequired: 'loanPurpose is required',
  phoneNumberRequired: 'phoneNumber is required',
  existingDebtInvalid: 'existingDebt must be a non-negative number',
  loanAmountInvalid: 'loanAmount must be a positive number',
  loanTermMonthsInvalid: 'loanTermMonths must be a positive number',
  monthlyCashflowInvalid: 'monthlyCashflow must be a number',
} as const;

export type SubmitApplicationValidationError =
  (typeof SUBMIT_APPLICATION_ERRORS)[keyof typeof SUBMIT_APPLICATION_ERRORS];
