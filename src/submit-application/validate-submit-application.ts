import { SubmitApplicationInput } from './submit-application.types';

export function validateSubmitApplicationInput(input: SubmitApplicationInput) {
  const errors: string[] = [];

  if (!input) {
    errors.push('input is required');
    return { isValid: false, errors };
  }

  if (!input.applicantName) errors.push('applicantName is required');
  if (!input.companyName) errors.push('companyName is required');
  if (!input.email) errors.push('email is required');
  if (!input.loanPurpose) errors.push('loanPurpose is required');
  if (!input.phoneNumber) errors.push('phoneNumber is required');

  if (typeof input.existingDebt !== 'number' || input.existingDebt < 0) {
    errors.push('existingDebt must be a non-negative number');
  }

  if (typeof input.loanAmount !== 'number' || input.loanAmount <= 0) {
    errors.push('loanAmount must be a positive number');
  }

  if (
    typeof input.loanTermMonths !== 'number' ||
    input.loanTermMonths <= 0
  ) {
    errors.push('loanTermMonths must be a positive number');
  }

  if (
    typeof input.monthlyCashflow !== 'number' ||
    Number.isNaN(input.monthlyCashflow)
  ) {
    errors.push('monthlyCashflow must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}