// Accounting Models - GL Accounts, Transactions
import { BaseEntity, CurrencyCode } from './common.model';

// ============ GL ACCOUNT ============

export interface GLAccount extends BaseEntity {
  // Account Info
  accountNumber: string;
  accountName: string;
  accountNameEn?: string;
  
  // Type & Category
  accountType: GLAccountType;
  accountTypeName?: string;
  category: GLAccountCategory;
  categoryName?: string;
  
  // Hierarchy
  parentAccountId?: number;
  parentAccountNumber?: string;
  level: number;
  isHeader: boolean;
  
  // Balances
  balance: number;
  debitBalance: number;
  creditBalance: number;
  openingBalance: number;
  
  // Currency
  currency: CurrencyCode;
  
  // Settings
  isActive: boolean;
  allowDirectPosting: boolean;
  
  // System Flags
  isSystemAccount: boolean;
  systemCode?: GLSystemAccountCode;
  
  // Notes
  description?: string;
}

export type GLAccountType = 
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'INCOME'
  | 'EXPENSE';

export type GLAccountCategory = 
  | 'CASH'
  | 'BANK'
  | 'LOANS_RECEIVABLE'
  | 'DEPOSITS_PAYABLE'
  | 'INTEREST_INCOME'
  | 'INTEREST_EXPENSE'
  | 'FEE_INCOME'
  | 'OPERATING_EXPENSE'
  | 'DONATIONS_RECEIVED'
  | 'OTHER';

export type GLSystemAccountCode = 
  | 'CASH_MAIN'
  | 'BANK_MAIN'
  | 'LOANS_RECEIVABLE'
  | 'DEPOSITS_PAYABLE'
  | 'INTEREST_INCOME'
  | 'INTEREST_EXPENSE'
  | 'REGISTRATION_FEE_INCOME'
  | 'DONATION_INCOME'
  | 'MASAV_CLEARING';

// ============ GL TRANSACTION ============

export interface GLTransaction extends BaseEntity {
  // Reference
  transactionNumber: string;
  journalNumber?: string;
  
  // Account
  accountId: number;
  accountNumber?: string;
  accountName?: string;
  
  // Type
  transactionType: GLTransactionType;
  transactionTypeName?: string;
  
  // Amount
  debitAmount: number;
  creditAmount: number;
  balance: number; // Running balance
  
  // Dates
  transactionDate: Date;
  valueDate: Date;
  postingDate: Date;
  
  // Source
  sourceType: GLSourceType;
  sourceId?: number;
  sourceReference?: string;
  
  // Related Entity
  entityType?: string;
  entityId?: number;
  personId?: number;
  personName?: string;
  
  // Description
  description: string;
  reference?: string;
  
  // Status
  status: GLTransactionStatus;
  statusName?: string;
  
  // Reversal
  isReversal: boolean;
  reversedTransactionId?: number;
  reversalTransactionId?: number;
  
  // Batch
  batchId?: number;
  batchNumber?: string;
}

export type GLTransactionType = 
  | 'DEBIT'
  | 'CREDIT';

export type GLSourceType = 
  | 'MANUAL'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_PAYMENT'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'DONATION'
  | 'REGISTRATION_FEE'
  | 'INTEREST'
  | 'FEE'
  | 'MASAV'
  | 'ADJUSTMENT'
  | 'OPENING_BALANCE';

export type GLTransactionStatus = 
  | 'POSTED'
  | 'PENDING'
  | 'REVERSED'
  | 'CANCELLED';

// ============ JOURNAL ENTRY ============

export interface JournalEntry extends BaseEntity {
  // Reference
  journalNumber: string;
  
  // Type
  journalType: JournalType;
  journalTypeName?: string;
  
  // Dates
  entryDate: Date;
  postingDate: Date;
  
  // Totals
  totalDebit: number;
  totalCredit: number;
  
  // Lines
  lines: JournalEntryLine[];
  
  // Description
  description: string;
  reference?: string;
  
  // Status
  status: JournalEntryStatus;
  
  // Source
  sourceType?: GLSourceType;
  sourceId?: number;
}

export type JournalType = 
  | 'GENERAL'
  | 'LOAN'
  | 'DEPOSIT'
  | 'PAYMENT'
  | 'ADJUSTMENT';

export type JournalEntryStatus = 
  | 'DRAFT'
  | 'POSTED'
  | 'CANCELLED';

export interface JournalEntryLine {
  lineNumber: number;
  accountId: number;
  accountNumber?: string;
  accountName?: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  entityType?: string;
  entityId?: number;
}

// ============ REPORTS ============

export interface TrialBalance {
  asOfDate: Date;
  accounts: TrialBalanceAccount[];
  totalDebit: number;
  totalCredit: number;
}

export interface TrialBalanceAccount {
  accountId: number;
  accountNumber: string;
  accountName: string;
  accountType: GLAccountType;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface AccountStatement {
  account: GLAccount;
  fromDate: Date;
  toDate: Date;
  openingBalance: number;
  closingBalance: number;
  transactions: GLTransaction[];
}

// ============ CPA REPORT ============

export interface CpaReport extends BaseEntity {
  // Period
  fromDate: Date;
  toDate: Date;
  
  // Totals
  totalLoansGiven: number;
  totalLoanPaymentsReceived: number;
  totalDepositsReceived: number;
  totalWithdrawalsPaid: number;
  totalDonationsReceived: number;
  totalRegistrationFees: number;
  totalInterestIncome: number;
  totalInterestExpense: number;
  
  // Lines
  lines: CpaReportLine[];
  
  // Status
  status: 'DRAFT' | 'FINAL';
  generatedAt: Date;
  generatedBy: number;
}

export interface CpaReportLine {
  date: Date;
  transactionType: string;
  description: string;
  reference: string;
  personName?: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
}

// ============ DTOs ============

export interface CreateGLAccountDto {
  accountNumber: string;
  accountName: string;
  accountType: GLAccountType;
  category: GLAccountCategory;
  parentAccountId?: number;
  currency?: CurrencyCode;
  openingBalance?: number;
  description?: string;
}

export interface CreateJournalEntryDto {
  journalType: JournalType;
  entryDate: Date;
  description: string;
  reference?: string;
  lines: {
    accountId: number;
    debitAmount: number;
    creditAmount: number;
    description?: string;
  }[];
}

export interface GenerateCpaReportDto {
  fromDate: Date;
  toDate: Date;
  includeDetails: boolean;
}
