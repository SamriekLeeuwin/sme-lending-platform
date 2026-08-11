export interface SubmitApplicationInput {
  applicantName: string;
  companyName: string;
  email: string;
  // TODO: geld later opslaan als centen ipv number, anders krijg je floating point gedoe
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
  // TODO: status later misschien typen met vaste waardes ipv string
  // TODO: spatie voor REJECTED weghalen en status flow 1 keer goed vastleggen
  status: "SUBMITTED" | "APPROVED" | " REJECTED";
}

export interface ValidationResult<TError extends string = string> {
  isValid: boolean;
  errors: TError[];
}
