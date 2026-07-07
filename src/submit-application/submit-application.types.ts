export interface SubmitApplicationInput {
  applicantName: string;
  companyName: string;
  email: string;
  existingDebt: number;
  loanAmount: number;
  loanPurpose: string;
  loanTermMonths: number;
  monthlyCashflow: number;
  phoneNumber: string;
}

export interface SubmitApplicationData extends SubmitApplicationInput {
  applicationId: string;
  createdAt: string;
  status: string;
}