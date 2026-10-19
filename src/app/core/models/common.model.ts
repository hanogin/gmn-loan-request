// Common models used across the application

export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
  isActive?: boolean;
}

export interface Address {
  street: string;
  houseNumber: string;
  apartment?: string;
  city: number; // LOV reference
  cityName?: string;
  postalCode?: string;
  country?: string;
}

export interface ContactInfo {
  phone?: string;
  mobilePhone: string;
  countryCode?: string;
  email: string;
  fax?: string;
}

export interface BankAccount {
  bankId: number;
  bankName?: string;
  branchNumber: string;
  branchName?: string;
  accountNumber: string;
  accountName: string;
  iban?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between';
  value: any;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface SelectOption {
  id: number;
  name: string;
  code?: string;
  parentId?: number;
  isDefault?: boolean;
}

// Currency types
export type CurrencyCode = 'ILS' | 'USD' | 'EUR' | 'GBP';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

// Date range for filters
export interface DateRange {
  from: Date;
  to: Date;
}

// Status colors for badges
export type StatusColor = 'default' | 'success' | 'warning' | 'destructive' | 'secondary';

export interface StatusConfig {
  label: string;
  color: StatusColor;
  icon?: string;
}
