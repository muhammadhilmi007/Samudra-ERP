/**
 * Samudra Paket ERP - Types Package
 * TypeScript type definitions for the entire project
 */

// API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  DRIVER = 'DRIVER',
  CHECKER = 'CHECKER',
  DEBT_COLLECTOR = 'DEBT_COLLECTOR',
  CUSTOMER = 'CUSTOMER',
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Pickup and Delivery Types
export interface Package {
  id: string;
  trackingNumber: string;
  status: PackageStatus;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  sender: {
    name: string;
    phone: string;
    address: Address;
  };
  recipient: {
    name: string;
    phone: string;
    address: Address;
  };
  service: ServiceType;
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PackageStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_DELIVERY = 'FAILED_DELIVERY',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export enum ServiceType {
  REGULAR = 'REGULAR',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Payment and Billing Types
export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  referenceNumber?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

// Mobile App Specific Types
export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  attempts: number;
  createdAt: string;
  updatedAt: string;
}
