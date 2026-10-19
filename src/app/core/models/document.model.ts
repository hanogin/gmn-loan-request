// Document and File Upload Models
import { BaseEntity } from './common.model';

// ============ DOCUMENT ============

export interface Document extends BaseEntity {
  // Reference
  documentNumber: string;
  
  // Type
  documentType: DocumentType;
  documentTypeName?: string;
  
  // Entity Reference
  entityType: DocumentEntityType;
  entityId: number;
  
  // Person
  personId?: number;
  personName?: string;
  
  // Document Details
  title: string;
  description?: string;
  
  // Dates
  documentDate: Date;
  issueDate?: Date;
  expiryDate?: Date;
  
  // File
  fileUploadId?: number;
  fileUpload?: FileUpload;
  
  // Status
  status: DocumentStatus;
  statusName?: string;
  
  // Print
  isPrinted: boolean;
  printDate?: Date;
  printCount: number;
  
  // Email
  isSent: boolean;
  sentDate?: Date;
  sentTo?: string;
  
  // Amount (for receipts)
  amount?: number;
  
  // Template
  templateCode?: string;
}

export type DocumentType = 
  | 'DEPOSIT_DOCUMENT'              // קבלה הפקדה לפיקדון
  | 'REGISTRATION_FEES_DOCUMENT'    // קבלה דמי רישום
  | 'DONATION_DOCUMENT'             // קבלה תרומה
  | 'DEPOSIT_WITHDRAWAL_DOCUMENT'   // אישור משיכה מפיקדון
  | 'LOAN_WITHDRAWAL_DOCUMENT'      // אישור משיכה/מסירת הלוואה
  | 'DEPOSIT_FOR_LOAN_DOCUMENT'     // קבלה הפקדה להלוואה
  | 'SHTAR_HOV_DOCUMENT'           // שטר חוב
  | 'DEPOSIT_SLIP_DOCUMENT'        // שטר הפקדה
  | 'ONLINE_REQUEST_DOCUMENT'      // הלוואה מקוונת
  | 'DEPOSIT_REPORT_DOCUMENT'      // דוח פעולות למפקידים
  | 'LOAN_REPORT_DOCUMENT'         // דוח פעולות ללווים
  | 'DONATION_LETTER_DOCUMENT'     // מכתב תרומה
  | 'INTERVIEW_INVITATION'          // הזמנה לראיון
  | 'CANCELLED_DOCUMENT';           // מסמך מבוטל

export type DocumentEntityType = 
  | 'LOAN_REQUEST'
  | 'LOAN'
  | 'SAVING'
  | 'DONATION'
  | 'PAY_LINE'
  | 'PERSON';

export type DocumentStatus = 
  | 'DRAFT'
  | 'ISSUED'
  | 'CANCELLED'
  | 'REPLACED';

// ============ FILE UPLOAD ============

export interface FileUpload extends BaseEntity {
  // File Info
  originalName: string;
  storedName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  
  // Category
  category: FileCategory;
  categoryName?: string;
  
  // Entity Reference
  entityType?: string;
  entityId?: number;
  
  // Person
  personId?: number;
  
  // Storage
  storagePath: string;
  storageUrl?: string;
  
  // Status
  status: FileStatus;
  
  // Metadata
  description?: string;
  tags?: string[];
  
  // Dates
  uploadDate: Date;
  expiryDate?: Date;
}

export type FileCategory = 
  | 'ID_CARD'              // צילום תעודת זהות
  | 'BANK_APPROVAL'        // אישור בנקאי
  | 'SALARY_SLIP'          // תלוש משכורת
  | 'GUARANTEE_CHECK'      // צ'ק בטחון
  | 'SHTAR_HOV_SIGNED'     // שטר חוב חתום
  | 'POWER_OF_ATTORNEY'    // ייפוי כח
  | 'OTHER_DOCUMENT'       // מסמך אחר
  | 'PROFILE_PHOTO'        // תמונת פרופיל
  | 'SIGNATURE';           // חתימה

export type FileStatus = 
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'DELETED';

// ============ PRINT OUT ============

export interface PrintOut extends BaseEntity {
  // Document Reference
  documentId: number;
  documentType: DocumentType;
  
  // Print Details
  printCode: PrintOutCode;
  printCodeName?: string;
  
  // Entity
  entityType: DocumentEntityType;
  entityId: number;
  
  // Content
  title: string;
  htmlContent?: string;
  pdfUrl?: string;
  
  // Status
  status: 'GENERATED' | 'PRINTED' | 'SENT';
  
  // Print History
  printedAt?: Date;
  printedBy?: number;
  copies?: number;
  
  // Send History
  sentAt?: Date;
  sentTo?: string;
  sendMethod?: 'EMAIL' | 'FAX' | 'MAIL';
}

export type PrintOutCode = 
  | 'LRQ_INTERVIEW_INVITATION'   // הזמנה לראיון
  | 'LRQ_INSTRUCTIONS'          // הוראות ללווה
  | 'LRQ_SHTAR_HOV'            // שטר חוב
  | 'LRQ_DEPOSITOR_APPROVAL'   // אישור מפקיד
  | 'LOAN_ACCEPTANCE'          // אישור קבלת הלוואה
  | 'LOAN_RECEIPT'             // קבלה להלוואה
  | 'REGISTRATION_FEE_RECEIPT' // קבלה לדמי רישום
  | 'DEPOSIT_RECEIPT'          // קבלה להפקדה
  | 'DONATION_RECEIPT'         // קבלה לתרומה
  | 'WITHDRAWAL_APPROVAL';     // אישור משיכה

// ============ DTOs ============

export interface UploadFileDto {
  file: File;
  category: FileCategory;
  entityType?: string;
  entityId?: number;
  personId?: number;
  description?: string;
}

export interface GenerateDocumentDto {
  documentType: DocumentType;
  entityType: DocumentEntityType;
  entityId: number;
  personId?: number;
  amount?: number;
  title?: string;
}

export interface PrintDocumentDto {
  documentId: number;
  copies?: number;
}

export interface SendDocumentDto {
  documentId: number;
  sendMethod: 'EMAIL' | 'FAX' | 'MAIL';
  recipientEmail?: string;
  recipientFax?: string;
  recipientAddress?: string;
}
