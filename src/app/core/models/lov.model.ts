// List of Values (LOV) Models
import { BaseEntity } from './common.model';

// ============ LOV (List of Values) ============

export interface Lov extends BaseEntity {
  // Code & Name
  code: string;
  name: string;
  nameEn?: string;
  
  // Type
  lovType: LovType;
  lovTypeName?: string;
  
  // Parent (for hierarchical LOVs)
  parentId?: number;
  parentCode?: string;
  
  // Display
  displayOrder: number;
  isDefault: boolean;
  
  // Status
  isActive: boolean;
  isSystem: boolean; // Cannot be deleted
  
  // Additional Data
  additionalData?: Record<string, any>;
  description?: string;
  
  // Children (for hierarchical LOVs)
  children?: Lov[];
}

export type LovType = 
  | 'IDENTITY_TYPE'        // סוג זיהוי: ת"ז, דרכון
  | 'TITLE'                // תואר: מר, גב', הרב
  | 'CITY'                 // עיר
  | 'BANK'                 // בנק
  | 'LOAN_PURPOSE'         // מטרת הלוואה
  | 'LOAN_STATUS'          // סטטוס הלוואה
  | 'SAVING_TYPE'          // סוג פיקדון
  | 'DONATION_PURPOSE'     // מטרת תרומה
  | 'PAYMENT_METHOD'       // אמצעי תשלום
  | 'ACTIVITY_TYPE'        // סוג פעילות
  | 'DOCUMENT_TYPE'        // סוג מסמך
  | 'RISK_LEVEL'           // רמת סיכון
  | 'NATURE_OF_PAYMENT'    // מהות תשלום
  | 'RELATION_TYPE'        // סוג קשר
  | 'CURRENCY'             // מטבע
  | 'COUNTRY';             // מדינה

// ============ SYSTEM SETTINGS ============

export interface SystemSetting extends BaseEntity {
  // Key
  settingKey: string;
  
  // Category
  category: SettingCategory;
  categoryName?: string;
  
  // Value
  value: string;
  valueType: SettingValueType;
  
  // Display
  displayName: string;
  description?: string;
  
  // Validation
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
  
  // Flags
  isRequired: boolean;
  isEditable: boolean;
  isEncrypted: boolean;
}

export type SettingCategory = 
  | 'GENERAL'
  | 'LOAN'
  | 'SAVING'
  | 'PAYMENT'
  | 'MASAV'
  | 'EMAIL'
  | 'PRINT'
  | 'SECURITY';

export type SettingValueType = 
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'JSON';

// ============ CURRENCY RATE ============

export interface CurrencyRate extends BaseEntity {
  // Currency
  fromCurrency: string;
  toCurrency: string;
  
  // Rate
  rate: number;
  inverseRate: number;
  
  // Dates
  effectiveDate: Date;
  expiryDate?: Date;
  
  // Source
  source: 'MANUAL' | 'BOI' | 'API';
  
  // Status
  isActive: boolean;
}

// ============ ADDITIONAL CHARGE SETTINGS ============

export interface AdditionalChargeSetting extends BaseEntity {
  // Charge Type
  chargeType: ChargeType;
  chargeTypeName?: string;
  
  // Calculation
  calculationType: ChargeCalculationType;
  
  // Amount
  fixedAmount?: number;
  percentage?: number;
  minAmount?: number;
  maxAmount?: number;
  
  // Applicability
  entityType: 'LOAN' | 'SAVING' | 'DONATION';
  
  // Dates
  effectiveFrom: Date;
  effectiveTo?: Date;
  
  // Status
  isActive: boolean;
  
  // Description
  description?: string;
}

export type ChargeType = 
  | 'REGISTRATION_FEE'    // דמי רישום
  | 'MANAGEMENT_FEE'      // דמי ניהול
  | 'LATE_PAYMENT_FEE'    // קנס איחור
  | 'EARLY_PAYMENT_FEE'   // עמלת פירעון מוקדם
  | 'DOCUMENT_FEE';       // עמלת מסמכים

export type ChargeCalculationType = 
  | 'FIXED'
  | 'PERCENTAGE'
  | 'TIERED';

// ============ LOAN GUARANTOR SETTINGS ============

export interface LoanGuarantorSetting extends BaseEntity {
  // Amount Range
  minLoanAmount: number;
  maxLoanAmount?: number;
  
  // Guarantor Requirements
  minGuarantors: number;
  maxGuarantors: number;
  
  // Status
  isActive: boolean;
  
  // Description
  description?: string;
}

// ============ COLLABORATION PARTNERS ============

export interface CollaborationPartner extends BaseEntity {
  // Name
  name: string;
  shortName?: string;
  
  // Type
  partnerType: PartnerType;
  partnerTypeName?: string;
  
  // Contact
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  
  // Bank Account (for transfers)
  bankId?: number;
  branchNumber?: string;
  accountNumber?: string;
  
  // Status
  isActive: boolean;
  
  // Notes
  notes?: string;
}

export type PartnerType = 
  | 'GMACH'           // גמ"ח אחר
  | 'AMUTA'           // עמותה
  | 'GOVERNMENT'      // גוף ממשלתי
  | 'FINANCIAL'       // מוסד פיננסי
  | 'OTHER';

// ============ DTOs ============

export interface CreateLovDto {
  code: string;
  name: string;
  nameEn?: string;
  lovType: LovType;
  parentId?: number;
  displayOrder?: number;
  isDefault?: boolean;
  description?: string;
}

export interface UpdateLovDto extends Partial<CreateLovDto> {
  id: number;
}

export interface CreateSystemSettingDto {
  settingKey: string;
  category: SettingCategory;
  value: string;
  valueType: SettingValueType;
  displayName: string;
  description?: string;
}

export interface UpdateSystemSettingDto {
  settingKey: string;
  value: string;
}
