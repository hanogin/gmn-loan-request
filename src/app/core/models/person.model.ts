// Person/Contact Models
import { BaseEntity, Address, ContactInfo, BankAccount } from './common.model';

export interface Person extends BaseEntity {
  // Identity
  identityType: number; // LOV: ID, Passport, etc.
  identityTypeName?: string;
  identityNumber: string;
  
  // Personal Info
  title: number; // LOV: Mr, Mrs, Rabbi, etc.
  titleName?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  fatherName?: string;
  
  // Contact
  address: Address;
  contact: ContactInfo;
  
  // Financial
  bankAccounts: BankAccount[];
  primaryBankAccount?: BankAccount;
  
  // Professional
  profession?: string;
  workplace?: string;
  monthlyIncome?: number;
  
  // Status & Flags
  personType: PersonType[];
  riskLevel?: RiskLevel;
  canBeGuarantor: boolean;
  canDeposit: boolean;
  isContactActive: boolean;
  
  // Relations
  institutionId: number;
  
  // Computed/Display
  totalLoans?: number;
  totalDeposits?: number;
  totalDonations?: number;
  activeLoansCount?: number;
  activeDepositsCount?: number;
}

export type PersonType = 'BORROWER' | 'DEPOSITOR' | 'GUARANTOR' | 'DONOR' | 'CONTACT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface PersonSummary {
  id: number;
  fullName: string;
  identityNumber: string;
  mobilePhone: string;
  email: string;
  personType: PersonType[];
  isActive: boolean;
}

export interface PersonDashboard {
  person: Person;
  
  // Loans
  activeLoans: LoanSummary[];
  pendingLoanRequests: LoanRequestSummary[];
  totalLoanBalance: number;
  
  // Deposits
  activeDeposits: DepositSummary[];
  totalDepositBalance: number;
  
  // Donations
  totalDonations: number;
  
  // Guarantees
  activeGuarantees: GuaranteeSummary[];
  
  // Recent Activity
  recentActivities: ActivitySummary[];
  
  // Payment Status
  nextPaymentDue?: Date;
  overdueAmount?: number;
}

// Simplified types for dashboard display
export interface LoanSummary {
  id: number;
  loanNumber: string;
  originalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  nextPaymentDate: Date;
  status: string;
}

export interface LoanRequestSummary {
  id: number;
  requestNumber: string;
  amount: number;
  status: string;
  requestDate: Date;
}

export interface DepositSummary {
  id: number;
  depositNumber: string;
  balance: number;
  interestRate: number;
  maturityDate?: Date;
}

export interface GuaranteeSummary {
  id: number;
  loanId: number;
  borrowerName: string;
  guaranteeAmount: number;
  status: string;
}

export interface ActivitySummary {
  id: number;
  type: string;
  description: string;
  date: Date;
}

// Create/Update DTOs
export interface CreatePersonDto {
  identityType: number;
  identityNumber: string;
  title: number;
  firstName: string;
  lastName: string;
  address: Address;
  contact: ContactInfo;
  profession?: string;
  bankAccount?: BankAccount;
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {
  id: number;
}
