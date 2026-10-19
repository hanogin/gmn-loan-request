// User and Authentication Models
import { BaseEntity } from './common.model';

// ============ USER ============

export interface User extends BaseEntity {
  // Identity
  username: string;
  email: string;
  
  // Profile
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  
  // Role & Permissions
  role: UserRole;
  roleName?: string;
  permissions: Permission[];
  
  // Institution
  institutionId: number;
  institutionName?: string;
  
  // Status
  isActive: boolean;
  isLocked: boolean;
  lockReason?: string;
  lockedAt?: Date;
  lockedBy?: number;
  
  // Password
  passwordChangedAt?: Date;
  mustChangePassword: boolean;
  
  // Login
  lastLoginAt?: Date;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  
  // Settings
  settings?: UserSettings;
}

export type UserRole = 
  | 'ADMIN'
  | 'MANAGER'
  | 'OPERATOR'
  | 'VIEWER'
  | 'ACCOUNTANT';

export type Permission = 
  // Person
  | 'PERSON_VIEW'
  | 'PERSON_CREATE'
  | 'PERSON_EDIT'
  | 'PERSON_DELETE'
  // Loan Request
  | 'LOAN_REQUEST_VIEW'
  | 'LOAN_REQUEST_CREATE'
  | 'LOAN_REQUEST_EDIT'
  | 'LOAN_REQUEST_APPROVE'
  | 'LOAN_REQUEST_REJECT'
  // Loan
  | 'LOAN_VIEW'
  | 'LOAN_CREATE'
  | 'LOAN_EDIT'
  // Saving
  | 'SAVING_VIEW'
  | 'SAVING_CREATE'
  | 'SAVING_EDIT'
  | 'WITHDRAWAL_APPROVE'
  // Donation
  | 'DONATION_VIEW'
  | 'DONATION_CREATE'
  | 'DONATION_EDIT'
  // Payment
  | 'PAYMENT_VIEW'
  | 'PAYMENT_CREATE'
  | 'PAYMENT_EDIT'
  // MASAV
  | 'MASAV_VIEW'
  | 'MASAV_CREATE'
  | 'MASAV_EXECUTE'
  // Reports
  | 'REPORT_VIEW'
  | 'REPORT_EXPORT'
  // Settings
  | 'SETTINGS_VIEW'
  | 'SETTINGS_EDIT'
  // Users
  | 'USER_VIEW'
  | 'USER_CREATE'
  | 'USER_EDIT'
  | 'USER_LOCK';

export interface UserSettings {
  language: 'he' | 'en' | 'ar' | 'ru';
  theme: 'light' | 'dark' | 'system';
  itemsPerPage: number;
  dateFormat: string;
  numberFormat: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  onNewLoanRequest: boolean;
  onPaymentDue: boolean;
  onWithdrawalRequest: boolean;
}

// ============ AUTHENTICATION ============

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  isSuccess: boolean;
  requiresTwoFactor?: boolean;
  requiresPasswordChange?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
  message?: string;
}

export interface TwoFactorRequest {
  username: string;
  verificationCode: string;
}

export interface PasswordChangeRequest {
  username: string;
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  verificationCode?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: User;
}

// ============ ONLINE REQUEST TOKEN ============

export interface OnlineRequestToken extends BaseEntity {
  // Token
  token: string;
  
  // Person (if pre-filled)
  personId?: number;
  personName?: string;
  identityNumber?: string;
  
  // Contact
  email?: string;
  phone?: string;
  
  // Dates
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  
  // Status
  status: OnlineTokenStatus;
  
  // Usage
  isUsed: boolean;
  loanRequestId?: number;
  
  // Notes
  notes?: string;
}

export type OnlineTokenStatus = 
  | 'ACTIVE'
  | 'USED'
  | 'EXPIRED'
  | 'CANCELLED';

// ============ SESSION ============

export interface Session extends BaseEntity {
  userId: number;
  
  // Token
  sessionToken: string;
  refreshToken?: string;
  
  // Dates
  startedAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  
  // Device
  ipAddress: string;
  userAgent: string;
  deviceType?: string;
  
  // Status
  isActive: boolean;
}

// ============ DTOs ============

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  id: number;
}

export interface LockUserDto {
  userId: number;
  reason: string;
}

export interface UnlockUserDto {
  userId: number;
}

export interface CreateOnlineTokenDto {
  personId?: number;
  email?: string;
  phone?: string;
  expiresInDays?: number;
  notes?: string;
}

export interface SendOnlineTokenDto {
  tokenId: number;
  sendMethod: 'EMAIL' | 'SMS' | 'BOTH';
}
