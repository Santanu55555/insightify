import { CsvRow, KpiData, RevenuePoint, LeadsBySource, Insight } from '@/types/analytics';

export function parseRows(raw: Record<string, string>[]): CsvRow[] {
  return raw.map((row) => ({
    date: row.date?.trim() ?? '',
    source: row.source?.trim() ?? '',
    leads: parseFloat(row.leads) || 0,
    conversion_rate: parseFloat(row.conversion_rate) || 0,
    revenue: parseFloat(row.revenue) || 0,
  }));
}

export function sortByDate(rows: CsvRow[]): CsvRow[] {
  return [...rows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function computeKpis(rows: CsvRow[]): KpiData {
  const totalLeads = rows.reduce((sum, r) => sum + r.leads, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const avgConversionRate =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + r.conversion_rate, 0) / rows.length
      : 0;
  return { totalLeads, totalRevenue, avgConversionRate };
}

export function buildRevenueOverTime(rows: CsvRow[]): RevenuePoint[] {
  const sorted = sortByDate(rows);
  const map = new Map<string, number>();
  for (const row of sorted) {
    map.set(row.date, (map.get(row.date) ?? 0) + row.revenue);
  }
  return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export function buildLeadsBySource(rows: CsvRow[]): LeadsBySource[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.source, (map.get(row.source) ?? 0) + row.leads);
  }
  return Array.from(map.entries())
    .map(([source, leads]) => ({ source, leads }))
    .sort((a, b) => b.leads - a.leads);
}

export function generateInsights(rows: CsvRow[]): Insight[] {
  if (rows.length === 0) return [];

  const insights: Insight[] = [];
  const sorted = sortByDate(rows);

  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const rev1 = firstHalf.reduce((s, r) => s + r.revenue, 0);
    const rev2 = secondHalf.reduce((s, r) => s + r.revenue, 0);
    if (rev2 > rev1) {
      insights.push({
        id: 'revenue-trend-up',
        type: 'positive',
        message: `Revenue increased ${(((rev2 - rev1) / rev1) * 100).toFixed(1)}% compared to the previous period.`,
      });
    } else if (rev2 < rev1) {
      insights.push({
        id: 'revenue-trend-down',
        type: 'warning',
        message: `Revenue dropped ${(((rev1 - rev2) / rev1) * 100).toFixed(1)}% compared to the previous period.`,
      });
    } else {
      insights.push({
        id: 'revenue-trend-flat',
        type: 'neutral',
        message: 'Revenue remained stable across both periods.',
      });
    }
  }

  const leadsBySource = buildLeadsBySource(rows);
  if (leadsBySource.length > 0) {
    const top = leadsBySource[0];
    insights.push({
      id: 'top-source',
      type: 'positive',
      message: `${top.source} generated the highest leads with ${top.leads.toLocaleString()} total.`,
    });
  }

  const avgCr =
    rows.reduce((s, r) => s + r.conversion_rate, 0) / rows.length;
  if (avgCr < 10) {
    insights.push({
      id: 'low-cr',
      type: 'warning',
      message: `Average conversion rate is ${avgCr.toFixed(2)}% — consider optimising your funnels.`,
    });
  } else {
    insights.push({
      id: 'good-cr',
      type: 'positive',
      message: `Solid average conversion rate of ${avgCr.toFixed(2)}% across all sources.`,
    });
  }

  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const revenuePerLead = totalLeads > 0 ? totalRevenue / totalLeads : 0;
  insights.push({
    id: 'rev-per-lead',
    type: 'neutral',
    message: `Each lead is generating $${revenuePerLead.toFixed(2)} in revenue on average.`,
  });

  return insights;
}
