export type CsvRow = {
  date: string;
  source: string;
  leads: number;
  conversion_rate: number;
  revenue: number;
};

export type KpiData = {
  totalLeads: number;
  totalRevenue: number;
  avgConversionRate: number;
};

export type RevenuePoint = {
  date: string;
  revenue: number;
};

export type LeadsBySource = {
  source: string;
  leads: number;
};

export type Insight = {
  id: string;
  type: 'positive' | 'neutral' | 'warning';
  message: string;
};
