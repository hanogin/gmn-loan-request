// Loan and Loan Request Models
import { BaseEntity, BankAccount, Money } from './common.model';
import { Person } from './person.model';

// ============ LOAN REQUEST ============

export interface LoanRequest extends BaseEntity {
  // Reference
  requestNumber: string;
  serialNumber?: number;

  // Borrower
  personId: number;
  person?: Person;

  // Loan Details
  requestedAmount: number;
  approvedAmount?: number;
  purpose: number; // LOV
  purposeName?: string;

  // Terms
  requestedTermMonths?: number;
  approvedTermMonths?: number;
  interestRate?: number;

  // Bank Details (for loan disbursement)
  bankAccount: BankAccount;

  // Guarantors
  guarantors: LoanGuarantor[];

  // Status & Workflow
  status: LoanRequestStatus;
  statusName?: string;
  currentStep?: LoanRequestStep;

  // Dates
  requestDate: Date;
  interviewDate?: Date;
  approvalDate?: Date;
  rejectionDate?: Date;

  // Registration Fee
  registrationFeeAmount: number;
  registrationFeePaid: boolean;
  registrationFeePaymentDate?: Date;

  // Documents
  documentsComplete: boolean;

  // Notes
  notes?: string;
  rejectionReason?: string;

  // Online Request
  isOnlineRequest: boolean;
  onlineToken?: string;
}

export type LoanRequestStatus =
  | 'DRAFT'
  | 'PENDING_DOCUMENTS'
  | 'PENDING_INTERVIEW'
  | 'PENDING_GUARANTORS'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CONVERTED_TO_LOAN';

export type LoanRequestStep =
  | 'PERSONAL_INFO'
  | 'DOCUMENTS'
  | 'BANK_ACCOUNT'
  | 'GUARANTORS'
  | 'REGISTRATION_FEE'
  | 'REVIEW'
  | 'COMPLETE';

export interface LoanGuarantor extends BaseEntity {
  loanRequestId?: number;
  loanId?: number;

  // Guarantor Person
  personId?: number;
  person?: Person;

  // Or inline details (for online requests)
  firstName: string;
  lastName: string;
  identityType: number;
  identityNumber: string;
  phone: string;
  email: string;
  address?: {
    street: string;
    houseNumber: string;
    apartment?: string;
    city: number;
  };
  profession?: string;

  // Status
  isSaved: boolean;
  isVerified: boolean;
  verificationDate?: Date;

  // Guarantee Details
  guaranteeAmount?: number;
  guaranteePercentage?: number;
}

// ============ LOAN ============

export interface Loan extends BaseEntity {
  // Reference
  loanNumber: string;
  loanRequestId?: number;

  // Borrower
  personId: number;
  person?: Person;

  // Loan Details
  loanAmount: number;         // Original loan amount
  currentBalance: number;     // Current balance to pay
  totalPaid: number;

  // Legacy aliases (for compatibility)
  originalAmount?: number;
  remainingBalance?: number;

  // Terms
  numberOfPayments: number;   // Total number of payments
  termMonths?: number;        // Alternative: term in months
  interestRate: number;
  monthlyPayment: number;

  // Payment Schedule
  paymentDay: number;         // Day of month for payment (1-28)

  // Dates
  startDate: Date;
  endDate?: Date;
  nextPaymentDate?: Date;
  lastPaymentDate?: Date;

  // Status
  status: LoanStatus;
  statusName?: string;

  // Payment Info
  paymentMethod?: PaymentMethodType;
  paymentMethodName?: string;
  bankAccountId?: number;
  bankAccount?: BankAccount;

  // Purpose
  purpose?: string;
  purposeName?: string;

  // MASAV (Direct Debit)
  masavActive?: boolean;
  masavCode?: string;

  // Guarantors
  guarantors?: number[];        // Person IDs of guarantors
  guarantorDetails?: LoanGuarantor[];

  // Finance Source
  financeSourceId?: number;
  financeSourceName?: string;

  // Calculated
  paidPayments?: number;
  paidPaymentsCount?: number;
  remainingPaymentsCount?: number;
  overduePaymentsCount?: number;
  overdueAmount?: number;

  // Notes
  notes?: string;
}

export type LoanStatus =
  | 'ACTIVE'
  | 'OVERDUE'
  | 'CLOSED'
  | 'FROZEN'
  | 'COMPLETED'
  | 'DEFAULTED'
  | 'RESTRUCTURED'
  | 'WRITTEN_OFF'
  | 'CANCELLED';

export type PaymentMethodType =
  | 'CASH'
  | 'CHECK'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'MASAV'
  | 'STANDING_ORDER';

// ============ LOAN PAYMENT SCHEDULE ============

export interface LoanPaymentSchedule {
  loanId: number;
  payments: ScheduledPayment[];
  totalAmount: number;
  totalPrincipal: number;
  totalInterest: number;
}

export interface ScheduledPayment {
  paymentNumber: number;
  dueDate: Date;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: PaymentStatus;
  paidDate?: Date;
  paidAmount?: number;
}

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'CANCELLED';

// ============ DTOs ============

export interface CreateLoanRequestDto {
  personId?: number;
  requestedAmount: number;
  purpose: number;
  requestedTermMonths?: number;
  bankAccount: BankAccount;
  guarantors: Omit<LoanGuarantor, 'id' | 'createdAt' | 'updatedAt'>[];
  isOnlineRequest: boolean;
}

export interface ApproveLoanRequestDto {
  loanRequestId: number;
  approvedAmount: number;
  approvedTermMonths: number;
  interestRate: number;
  notes?: string;
}

export interface CreateLoanFromRequestDto {
  loanRequestId: number;
  startDate: Date;
  paymentMethod: PaymentMethodType;
  financeSourceId?: number;
}
