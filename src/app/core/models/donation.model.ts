// Donation Models
import { BaseEntity, BankAccount } from './common.model';
import { Person } from './person.model';
import { PaymentMethodType } from './loan.model';

export interface Donation extends BaseEntity {
  // Reference
  donationNumber: string;
  receiptNumber?: string;
  
  // Donor
  personId: number;
  person?: Person;
  
  // Donation Details
  amount: number;
  currency: string;
  amountInILS?: number; // Converted amount
  
  // Type & Purpose
  donationType: DonationType;
  donationTypeName?: string;
  purpose?: number; // LOV
  purposeName?: string;
  campaign?: string;
  
  // Payment
  paymentMethod: PaymentMethodType;
  paymentMethodName?: string;
  
  // Bank/Check Details
  bankAccount?: BankAccount;
  checkNumber?: string;
  checkDate?: Date;
  
  // Credit Card (masked)
  creditCardLast4?: string;
  creditCardExpiry?: string;
  
  // Dates
  donationDate: Date;
  receiptDate?: Date;
  
  // Status
  status: DonationStatus;
  statusName?: string;
  
  // Receipt
  receiptSent: boolean;
  receiptSentDate?: Date;
  receiptSentMethod?: 'EMAIL' | 'MAIL' | 'HAND';
  
  // Recurring
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringEndDate?: Date;
  parentDonationId?: number; // For recurring donations
  
  // Tax
  isTaxDeductible: boolean;
  taxReceiptNumber?: string;
  
  // Notes
  dedicatedTo?: string; // "לעילוי נשמת" etc.
  notes?: string;
  internalNotes?: string;
}

export type DonationType = 
  | 'ONE_TIME'      // תרומה חד פעמית
  | 'RECURRING'     // תרומה חוזרת
  | 'PLEDGE'        // התחייבות
  | 'IN_KIND'       // תרומה בעין
  | 'MEMORIAL';     // תרומה לזכר

export type DonationStatus = 
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'BOUNCED';      // Check bounced

export type RecurringFrequency = 
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY';

// ============ DONATION SUMMARY ============

export interface DonationSummary {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  largestDonation: number;
  donorCount: number;
  
  byType: {
    type: DonationType;
    count: number;
    amount: number;
  }[];
  
  byPaymentMethod: {
    method: PaymentMethodType;
    count: number;
    amount: number;
  }[];
  
  byMonth: {
    month: string;
    count: number;
    amount: number;
  }[];
}

// ============ DTOs ============

export interface CreateDonationDto {
  personId: number;
  amount: number;
  currency?: string;
  donationType: DonationType;
  purpose?: number;
  campaign?: string;
  paymentMethod: PaymentMethodType;
  bankAccount?: BankAccount;
  checkNumber?: string;
  checkDate?: Date;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringEndDate?: Date;
  dedicatedTo?: string;
  notes?: string;
}

export interface UpdateDonationDto extends Partial<CreateDonationDto> {
  id: number;
}

export interface IssueDonationReceiptDto {
  donationId: number;
  sendMethod: 'EMAIL' | 'MAIL' | 'HAND';
  recipientEmail?: string;
  recipientAddress?: string;
}
