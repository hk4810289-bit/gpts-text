export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'LEARNING' | 'COMPLETED' | 'LOW_BUDGET' | 'NO_CAMPAIGN';

export interface Client {
  id: string;
  name: string;
  company?: string;
  spentUSD: number;
  spentBDT: number;
  remainingBalanceUSD: number;
  remainingBalanceBDT: number;
  usdToBdtRate: number;
  lastCampaignStatus: CampaignStatus;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUpdate {
  id: string;
  clientId: string;
  clientName: string;
  spentUSD: number;
  spentBDT: number;
  impressions: number;
  clicks: number;
  leads: number;
  campaignStatus: CampaignStatus;
  notes?: string;
  timestamp: string;
}

export interface TopUp {
  id: string;
  clientId: string;
  clientName: string;
  amountUSD: number;
  amountBDT: number;
  notes?: string;
  timestamp: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  authenticated: boolean;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  ip?: string;
  durationMs?: number;
}

export type Language = 'en' | 'bn';
