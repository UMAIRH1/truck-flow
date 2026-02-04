// User Types
export type UserRole = "manager" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  country?: string;
  createdAt: Date;
}

// Load Types
export type LoadStatus = "pending" | "accepted" | "rejected" | "in-progress" | "delivered" | "completed" | "dispute";

export type PaymentTerms = 30 | 45 | 60 | 90 | 120;

export type ShippingType = "FTL" | "LTL" | "Partial" | "Expedited";

export interface Load {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  clientName: string;
  clientPrice: number;
  driverPrice: number;
  paymentTerms: PaymentTerms;
  expectedPayoutDate: Date;
  loadingDate: Date;
  loadingTime: string;
  shippingType: ShippingType;
  loadWeight: number;
  pallets?: number;
  assignedDriver?: Driver;
  status: LoadStatus;
  notes?: string;
  podImages?: string[];
  invoices?: string[];
  documents?: string[];
  fuel?: number;
  tolls?: number;
  otherExpenses?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  timeline?: LoadTimelineItem[];
}

export interface LoadTimelineItem {
  status: string;
  date: Date;
  description?: string;
  completed: boolean;
}

// Driver Types
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  isAvailable: boolean;
}

// Finance Types
export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  completedLoads: number;
}

export interface CashflowItem {
  id: string;
  type: "client" | "partner";
  name: string;
  amount: number;
  since: Date;
  expected: Date;
  status: "outstanding" | "overdue" | "due-this-week";
  daysOverdue?: number;
}

// Notification Types
export type NotificationType = "load_created" | "load_assigned" | "load_accepted" | "load_rejected" | "load_completed" | "load_cancelled";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  loadId?: string;
  loadNumber?: string;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  type: "bank" | "card";
  name: string;
  details: string;
}

// Chart Data Types
export interface ChartDataPoint {
  month: string;
  value: number;
}

// Filter Types
export interface LoadFilters {
  status?: LoadStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  driver?: string;
}
