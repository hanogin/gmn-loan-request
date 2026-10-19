// Activity and Comment Models
import { BaseEntity } from './common.model';

// ============ ACTIVITY ============

export interface Activity extends BaseEntity {
  // Type
  activityType: ActivityType;
  activityTypeName?: string;
  
  // Entity Reference
  entityType: ActivityEntityType;
  entityId: number;
  
  // Person (if related to a person)
  personId?: number;
  personName?: string;
  
  // Activity Details
  subject: string;
  description?: string;
  
  // Dates
  activityDate: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  dueDate?: Date;
  
  // Status
  status: ActivityStatus;
  statusName?: string;
  priority: ActivityPriority;
  
  // Assignment
  assignedTo?: number;
  assignedToName?: string;
  
  // Outcome
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  
  // Related
  relatedActivityId?: number;
  
  // Document
  documentId?: number;
  
  // Notes
  notes?: string;
}

export type ActivityType = 
  | 'PHONE_CALL'              // שיחת טלפון
  | 'MEETING'                  // פגישה
  | 'SEND_EMAIL'              // שליחת מייל
  | 'SEND_FAX'                // שליחת פקס
  | 'SEND_MAIL'               // שליחת דואר
  | 'PHONE_APPROVAL'          // אישור טלפוני
  | 'INTERVIEW_INVITATION'    // הזמנה לראיון
  | 'OTHER'                    // אחר
  // Loan Request Activities
  | 'LR_ID_CARD'              // צילום ת"ז
  | 'LR_PIKADON_APPROVAL'     // אישור פיקדון
  | 'LR_ASSURANCE_CHECK'      // צ'ק בטחון
  | 'LR_BANK_APPROVAL'        // אישור בנקאי
  | 'LR_SHTAR_HOV'            // שטר חוב
  | 'LR_MEYUPE_KOAH'          // מיופה כח
  | 'LR_PAYMENT_APPROVAL'     // אישור תשלום
  | 'LR_CANCEL'               // ביטול בקשה
  | 'LR_REJECT'               // דחיית בקשה
  | 'LR_INTERVIEW_APPROVE'    // אישור ראיון
  | 'LR_GUARANTEE_APPROVE'    // אישור ערבות
  | 'LR_DOCUMENTS_APPROVAL'   // אישור מסמכים
  // Person Definitions
  | 'RISK_DEF_PERSONINST'                   // הגדרת סיכון
  | 'GUARANTEE_POSSIBILITY_DEF_PERSONINST'  // הגדרת אפשרות ערבות
  | 'CAN_BE_GUARANTEE_DEF_PERSONINST'       // יכול להיות ערב
  | 'CAN_DEPOSIT_DEF_PERSONINST'            // יכול להפקיד
  | 'CONTACT_ACTIVE_DEF_PERSONINST'         // איש קשר פעיל
  // Withdrawal
  | 'WITHDRAWAL_AUTHORIZATIONS';            // אישור משיכה

export type ActivityEntityType = 
  | 'PERSON'
  | 'LOAN_REQUEST'
  | 'LOAN'
  | 'SAVING'
  | 'DONATION'
  | 'GENERAL';

export type ActivityStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PENDING';

export type ActivityPriority = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

// ============ COMMENT ============

export interface Comment extends BaseEntity {
  // Entity Reference
  entityType: ActivityEntityType;
  entityId: number;
  
  // Comment Details
  text: string;
  
  // Author
  authorId: number;
  authorName?: string;
  
  // Dates
  commentDate: Date;
  editedDate?: Date;
  
  // Reply
  parentCommentId?: number;
  replies?: Comment[];
  
  // Flags
  isInternal: boolean;
  isPinned: boolean;
}

// ============ NOTIFICATION ============

export interface Notification extends BaseEntity {
  // Recipient
  userId: number;
  
  // Type
  notificationType: NotificationType;
  notificationTypeName?: string;
  
  // Content
  title: string;
  message: string;
  
  // Related
  entityType?: string;
  entityId?: number;
  actionUrl?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Dates
  notificationDate: Date;
  expiryDate?: Date;
}

export type NotificationType = 
  | 'LOAN_REQUEST_NEW'
  | 'LOAN_REQUEST_APPROVED'
  | 'LOAN_REQUEST_REJECTED'
  | 'PAYMENT_DUE'
  | 'PAYMENT_OVERDUE'
  | 'WITHDRAWAL_REQUEST'
  | 'DOCUMENT_UPLOADED'
  | 'ACTIVITY_ASSIGNED'
  | 'SYSTEM_ALERT';

// ============ AUDIT LOG ============

export interface AuditLog extends BaseEntity {
  // User
  userId: number;
  userName?: string;
  
  // Action
  action: AuditAction;
  actionName?: string;
  
  // Entity
  entityType: string;
  entityId: number;
  
  // Changes
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  
  // Date
  timestamp: Date;
  
  // Description
  description?: string;
}

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'PRINT'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT';

// ============ DTOs ============

export interface CreateActivityDto {
  activityType: ActivityType;
  entityType: ActivityEntityType;
  entityId: number;
  personId?: number;
  subject: string;
  description?: string;
  scheduledDate?: Date;
  assignedTo?: number;
  priority?: ActivityPriority;
}

export interface CreateCommentDto {
  entityType: ActivityEntityType;
  entityId: number;
  text: string;
  parentCommentId?: number;
  isInternal?: boolean;
}

export interface UpdateActivityStatusDto {
  activityId: number;
  status: ActivityStatus;
  outcome?: string;
  notes?: string;
}
