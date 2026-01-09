
export interface CarrierData {
  mcNumber: string;
  dotNumber: string;
  legalName: string;
  dbaName: string;
  entityType: string;
  status: string;
  email: string;
  phone: string;
  powerUnits: string;
  drivers: string;
  physicalAddress: string;
  mailingAddress: string;
  dateScraped: string;
  // Extended fields from Python script
  mcs150Date: string;
  mcs150Mileage: string;
  operationClassification: string[];
  carrierOperation: string[];
  cargoCarried: string[];
  outOfServiceDate: string;
  stateCarrierId: string;
  dunsNumber: string;
}

export interface ScraperConfig {
  startPoint: string;
  recordCount: number;
  includeCarriers: boolean;
  includeBrokers: boolean;
  onlyAuthorized: boolean;
  useMockData: boolean;
  useProxy: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: 'Free' | 'Starter' | 'Pro' | 'Enterprise';
  dailyLimit: number;
  recordsExtractedToday: number;
  lastActive: string;
  ipAddress: string;
  isOnline: boolean;
}

export type ViewState = 'dashboard' | 'scraper' | 'subscription' | 'settings' | 'admin';