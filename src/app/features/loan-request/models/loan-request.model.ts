/**
 * Loan Request Data Models
 * Based on the legacy GMN-CLIENT application
 */

export interface LoanRequest {
  // Token for access validation
  token: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  identityType: number;
  identityNumber: string;
  title: number;
  street: string;
  houseNumber: string;
  apartment: string;
  city: number;
  countryCode: string;
  mobilePhone: string;
  phone: string;
  email: string;
  profession: string;
  loanAmount: number;
  amountInWords: string;
  purpose: number;
  
  // File Attachments
  attachmentFiles: File[];
  
  // Bank Account Details
  bankId: number;
  branchNumber: string;
  accountName: string;
  accountNumber: string;
  
  // Guarantors (3-6 required)
  guarantors: Guarantor[];
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  lastDigits?: string;
  dueDate?: string;
  registrationFeeAmount: number;
}

export interface Guarantor {
  firstName: string;
  lastName: string;
  identityType: number;
  identityNumber: string;
  street: string;
  houseNumber: string;
  apartment: string;
  city: number;
  countryCode: string;
  phone: string;
  profession: string;
  email: string;
  isSaved: boolean;
}

export interface Lov {
  id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
}

export type PaymentMethod = 'credit' | 'bank_transfer';

export type IdentityTypeCode = 'ID' | 'PASSPORT';

export interface TokenValidation {
  isValid: boolean;
  message: string;
}

export interface LoanRequestResponse {
  success: boolean;
  requestId: number;
  serialNumber: string;
  payLineId?: number;
  message?: string;
}

export interface LoanRequestStep {
  id: number;
  labelKey: string;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
}

export const LOAN_REQUEST_STEPS: LoanRequestStep[] = [
  { id: 1, labelKey: 'loanRequest.steps.personalInfo', icon: 'user', isCompleted: false, isActive: true },
  { id: 2, labelKey: 'loanRequest.steps.fileUpload', icon: 'upload', isCompleted: false, isActive: false },
  { id: 3, labelKey: 'loanRequest.steps.bankAccount', icon: 'building-2', isCompleted: false, isActive: false },
  { id: 4, labelKey: 'loanRequest.steps.guarantors', icon: 'users', isCompleted: false, isActive: false },
  { id: 5, labelKey: 'loanRequest.steps.payment', icon: 'credit-card', isCompleted: false, isActive: false },
  { id: 6, labelKey: 'loanRequest.steps.completion', icon: 'check-circle', isCompleted: false, isActive: false },
];

export const MIN_GUARANTORS = 3;
export const MAX_GUARANTORS = 6;
export const DEFAULT_COUNTRY_CODE = '972';
export const DEFAULT_REGISTRATION_FEE = 50;
