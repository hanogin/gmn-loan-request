// Saving (Deposit/Pikadon) Models
import { BaseEntity, BankAccount } from './common.model';
import { Person } from './person.model';
import { PaymentMethodType } from './loan.model';

export interface Saving extends BaseEntity {
  // Reference
  savingNumber: string;
  
  // Depositor
  personId: number;
  person?: Person;
  
  // Type
  savingType: SavingType;
  savingTypeName?: string;
  
  // Amounts
  initialAmount: number;
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  accruedInterest: number;
  
  // Terms
  interestRate: number;
  termMonths?: number; // null for open-ended
  
  // Dates
  openDate: Date;
  maturityDate?: Date;
  lastTransactionDate?: Date;
  
  // Status
  status: SavingStatus;
  statusName?: string;
  
  // Payment Info (for recurring deposits)
  paymentMethod?: PaymentMethodType;
  bankAccount?: BankAccount;
  monthlyDepositAmount?: number;
  
  // MASAV (Direct Debit for deposits)
  masavActive: boolean;
  masavCode?: string;
  
  // Linked Loan (if deposit is collateral)
  linkedLoanId?: number;
  linkedLoanNumber?: string;
  
  // Withdrawal Settings
  canWithdraw: boolean;
  minBalanceRequired?: number;
  withdrawalNoticeDays?: number;
  
  // Notes
  notes?: string;
}

export type SavingType = 
  | 'REGULAR'        // פיקדון רגיל
  | 'LOAN_COLLATERAL' // פיקדון כבטוחה להלוואה
  | 'RECURRING'       // פיקדון חוזר
  | 'FIXED_TERM';     // פיקדון לתקופה קצובה

export type SavingStatus = 
  | 'ACTIVE'
  | 'MATURED'
  | 'CLOSED'
  | 'FROZEN'
  | 'PENDING_WITHDRAWAL';

// ============ SAVING TRANSACTIONS ============

export interface SavingTransaction extends BaseEntity {
  savingId: number;
  
  // Transaction Details
  transactionType: SavingTransactionType;
  transactionTypeName?: string;
  
  amount: number;
  balanceAfter: number;
  
  // Reference
  referenceNumber?: string;
  documentId?: number;
  
  // Date
  transactionDate: Date;
  valueDate: Date;
  
  // Payment Details
  paymentMethod: PaymentMethodType;
  checkNumber?: string;
  bankReference?: string;
  
  // Notes
  notes?: string;
}

export type SavingTransactionType = 
  | 'DEPOSIT'           // הפקדה
  | 'WITHDRAWAL'        // משיכה
  | 'INTEREST_CREDIT'   // זיכוי ריבית
  | 'FEE'              // עמלה
  | 'TRANSFER_IN'       // העברה פנימית - כניסה
  | 'TRANSFER_OUT'      // העברה פנימית - יציאה
  | 'ADJUSTMENT';       // תיקון

// ============ WITHDRAWAL REQUEST ============

export interface WithdrawalRequest extends BaseEntity {
  savingId: number;
  saving?: Saving;
  
  personId: number;
  person?: Person;
  
  // Request Details
  requestedAmount: number;
  approvedAmount?: number;
  
  // Status
  status: WithdrawalRequestStatus;
  statusName?: string;
  
  // Dates
  requestDate: Date;
  approvalDate?: Date;
  executionDate?: Date;
  
  // Approval
  approvedBy?: number;
  approverName?: string;
  
  // Transfer Details
  transferMethod: PaymentMethodType;
  bankAccount?: BankAccount;
  
  // Notes
  reason?: string;
  notes?: string;
  rejectionReason?: string;
}

export type WithdrawalRequestStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED'
  | 'CANCELLED';

// ============ DTOs ============

export interface CreateSavingDto {
  personId: number;
  savingType: SavingType;
  initialAmount: number;
  interestRate: number;
  termMonths?: number;
  paymentMethod?: PaymentMethodType;
  bankAccount?: BankAccount;
  monthlyDepositAmount?: number;
  linkedLoanId?: number;
}

export interface DepositDto {
  savingId: number;
  amount: number;
  paymentMethod: PaymentMethodType;
  checkNumber?: string;
  notes?: string;
}

export interface WithdrawDto {
  savingId: number;
  amount: number;
  transferMethod: PaymentMethodType;
  bankAccount?: BankAccount;
  reason?: string;
}
