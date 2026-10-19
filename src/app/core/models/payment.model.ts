// Payment Models - PayLine, PayHeader, MASAV
import { BaseEntity, BankAccount } from './common.model';
import { PaymentMethodType } from './loan.model';

// ============ PAY HEADER ============

export interface PayHeader extends BaseEntity {
  // Reference
  headerNumber: string;
  documentNumber?: string;

  // Type
  payType: PayType;
  payTypeName?: string;
  entityType: PayEntityType;
  entityId: number; // Loan, Saving, Donation ID

  // Person
  personId: number;
  personName?: string;

  // Amounts
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Dates
  headerDate: Date;
  dueDate?: Date;

  // Status
  status: PayHeaderStatus;
  statusName?: string;

  // Payment Method
  paymentMethod: PaymentMethodType;
  bankAccount?: BankAccount;

  // Lines
  payLines: PayLine[];

  // Notes
  notes?: string;
}

export type PayType = 'DEPOSIT' | 'WITHDRAWAL';

export type PayEntityType = 'LOAN' | 'SAVING' | 'DONATION' | 'REGISTRATION_FEE';

export type PayHeaderStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'BOUNCED';

// ============ PAY LINE ============

export interface PayLine extends BaseEntity {
  // Reference
  payHeaderId: number;
  lineNumber: number;

  // Entity Reference
  entityType: PayEntityType;
  entityId: number;

  // Person
  personId: number;
  personName?: string;

  // Payment Details
  payType: PayType;
  payTypeName?: string;

  amount: number;

  // Dates
  dueDate: Date;
  paidDate?: Date;
  valueDate?: Date;

  // Status
  status: PayLineStatus;
  statusName?: string;

  // Payment Method
  paymentMethod: PaymentMethodType;
  paymentMethodName?: string;

  // Check Details
  checkNumber?: string;
  checkDate?: Date;
  checkBankId?: number;
  checkBranchNumber?: string;

  // Bank Transfer
  bankReference?: string;

  // Credit Card
  creditCardLast4?: string;
  authorizationNumber?: string;

  // MASAV
  masavReference?: string;
  masavBatchId?: number;

  // Nature of Payment (מהות התשלום)
  natureOfPayment?: number; // LOV
  natureOfPaymentName?: string;

  // Document
  documentId?: number;
  documentNumber?: string;

  // Notes
  notes?: string;
}

export type PayLineStatus =
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'PARTIAL'
  | 'BOUNCED'
  | 'CANCELLED'
  | 'REFUNDED';

// ============ MASAV (Bank Direct Debit) ============

export interface MasavHeader extends BaseEntity {
  // Reference
  batchNumber: string;

  // Type
  masavType: MasavType;
  masavTypeName?: string;

  // File Details
  institutionCode: string;
  sendingBank: string;
  sendingBranch: string;
  sendingAccount: string;

  // Dates
  createDate: Date;
  executionDate: Date;
  returnDate?: Date;

  // Totals
  totalRecords: number;
  totalAmount: number;
  successCount?: number;
  failedCount?: number;

  // Status
  status: MasavStatus;
  statusName?: string;

  // File
  fileName?: string;
  fileContent?: string;

  // Lines
  masavLines: MasavLine[];
}

export type MasavType =
  | 'LOAN_COLLECTION'      // גביית הלוואות
  | 'DEPOSIT_COLLECTION'   // גביית פיקדונות
  | 'LOAN_DISBURSEMENT'    // העברת הלוואות
  | 'DEPOSIT_WITHDRAWAL';  // משיכת פיקדונות

export type MasavStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SENT'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export interface MasavLine extends BaseEntity {
  masavHeaderId: number;

  // Reference
  lineNumber: number;
  payLineId?: number;

  // Person & Entity
  personId: number;
  personName?: string;
  entityType: PayEntityType;
  entityId: number;

  // Bank Details
  bankId: number;
  branchNumber: string;
  accountNumber: string;

  // Amount
  amount: number;

  // Status
  status: MasavLineStatus;
  statusName?: string;
  returnCode?: string;
  returnMessage?: string;

  // Notes
  notes?: string;
}

export type MasavLineStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'RETURNED';

// ============ RENEWAL MASAV ============

export interface RenewalMasavHeader extends BaseEntity {
  // Original MASAV Reference
  originalMasavHeaderId?: number;

  // Reference
  batchNumber: string;

  // Dates
  createDate: Date;
  effectiveDate: Date;

  // Totals
  totalRecords: number;
  totalAmount: number;

  // Status
  status: MasavStatus;
  statusName?: string;

  // Lines
  renewalLines: RenewalMasavLine[];
}

export interface RenewalMasavLine extends BaseEntity {
  renewalHeaderId: number;

  // Original Reference
  originalPayLineId?: number;
  loanId: number;

  // Person
  personId: number;
  personName?: string;

  // Bank Details
  bankId: number;
  branchNumber: string;
  accountNumber: string;

  // Old & New Amount
  currentAmount: number;
  newAmount: number;

  // Status
  status: MasavLineStatus;
  statusName?: string;
}

// ============ DTOs ============

export interface CreatePayLineDto {
  entityType: PayEntityType;
  entityId: number;
  personId: number;
  payType: PayType;
  amount: number;
  dueDate: Date;
  paymentMethod: PaymentMethodType;
  checkNumber?: string;
  checkDate?: Date;
  bankAccount?: BankAccount;
  notes?: string;
}

export interface CreateMasavBatchDto {
  masavType: MasavType;
  executionDate: Date;
  payLineIds?: number[];
  entityType?: PayEntityType;
  fromDate?: Date;
  toDate?: Date;
}

export interface ProcessMasavReturnDto {
  masavHeaderId: number;
  returnFileContent: string;
}
