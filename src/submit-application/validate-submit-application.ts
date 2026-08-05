import {
  SUBMIT_APPLICATION_ERRORS,
  SubmitApplicationValidationError,
} from './submit-application.errors';
import {
  SubmitApplicationInput,
  ValidationResult,
} from './submit-application.types';

function isMissingText(value: unknown) {
  return typeof value !== 'string' || value.trim().length === 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

function requireText(
  value: unknown,
  error: SubmitApplicationValidationError,
  errors: SubmitApplicationValidationError[],
) {
  if (isMissingText(value)) {
    errors.push(error);
  }
}

function requirePositiveNumber(
  value: unknown,
  error: SubmitApplicationValidationError,
  errors: SubmitApplicationValidationError[],
) {
  if (!isNumber(value) || value <= 0) {
    errors.push(error);
  }
}

export function validateSubmitApplicationInput(
  input: SubmitApplicationInput,
): ValidationResult<SubmitApplicationValidationError> {
  const errors: SubmitApplicationValidationError[] = [];

  if (!input) {
    errors.push(SUBMIT_APPLICATION_ERRORS.inputRequired);
    return { isValid: false, errors };
  }

  requireText(
    input.applicantName,
    SUBMIT_APPLICATION_ERRORS.applicantNameRequired,
    errors,
  );
  requireText(
    input.companyName,
    SUBMIT_APPLICATION_ERRORS.companyNameRequired,
    errors,
  );
  requireText(input.email, SUBMIT_APPLICATION_ERRORS.emailRequired, errors);
  requireText(
    input.loanPurpose,
    SUBMIT_APPLICATION_ERRORS.loanPurposeRequired,
    errors,
  );
  requireText(
    input.phoneNumber,
    SUBMIT_APPLICATION_ERRORS.phoneNumberRequired,
    errors,
  );

  if (!isNumber(input.existingDebt) || input.existingDebt < 0) {
    errors.push(SUBMIT_APPLICATION_ERRORS.existingDebtInvalid);
  }

  requirePositiveNumber(
    input.loanAmount,
    SUBMIT_APPLICATION_ERRORS.loanAmountInvalid,
    errors,
  );
  requirePositiveNumber(
    input.loanTermMonths,
    SUBMIT_APPLICATION_ERRORS.loanTermMonthsInvalid,
    errors,
  );

  if (!isNumber(input.monthlyCashflow)) {
    errors.push(SUBMIT_APPLICATION_ERRORS.monthlyCashflowInvalid);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
