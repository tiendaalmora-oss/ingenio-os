import { createHmac } from 'crypto';

export const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
export const META_APP_SECRET = process.env.META_APP_SECRET || '';
export const META_BASE_URL = process.env.META_BASE_URL || 'https://graph.facebook.com/v21.0';

export function generateAppSecretProof(): string {
  if (!META_APP_SECRET || !META_ACCESS_TOKEN) return '';
  return createHmac('sha256', META_APP_SECRET).update(META_ACCESS_TOKEN).digest('hex');
}

export async function metaFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!META_ACCESS_TOKEN) {
    throw new Error('META_ACCESS_TOKEN is not configured');
  }

  const url = new URL(`${META_BASE_URL}${endpoint}`);
  url.searchParams.set('access_token', META_ACCESS_TOKEN);
  
  const proof = generateAppSecretProof();
  if (proof) {
    url.searchParams.set('appsecret_proof', proof);
  }

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  // Next.js caching: revalidate every 5 minutes (300 seconds) to avoid Meta API rate limits
  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }
  });
  
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API Error: ${data.error.message} (code: ${data.error.code})`);
  }

  return data;
}

export async function fetchAllPages(endpoint: string, params: Record<string, string> = {}): Promise<any[]> {
  const firstPage = await metaFetch(endpoint, params);
  let results = firstPage.data || [];
  let nextUrl = firstPage.paging?.next;

  while (nextUrl) {
    const res = await fetch(nextUrl, { next: { revalidate: 300 } });
    const data = await res.json();
    if (data.error) break;
    results = results.concat(data.data || []);
    nextUrl = data.paging?.next;
  }

  return results;
}

// --- Specific Endpoints ---

export async function getAdAccounts() {
  return fetchAllPages('/me/adaccounts', {
    fields: 'name,account_id,account_status,currency,timezone_name,balance,amount_spent',
  });
}

export async function getAccountInsights(accountId: string, timeRange?: string, datePreset: string = 'last_7d') {
  const params: Record<string, string> = {
    fields: [
      'spend', 'impressions', 'reach', 'frequency', 'clicks', 'ctr', 'cpc', 'cpm',
      'actions', 'action_values', 'cost_per_action_type', 'purchase_roas',
    ].join(','),
    level: 'account',
  };
  
  if (timeRange) params.time_range = timeRange;
  else params.date_preset = datePreset;

  const data = await metaFetch(`/${accountId}/insights`, params);
  return data.data?.[0] || null;
}

export async function getCampaignInsights(accountId: string, timeRange?: string, datePreset: string = 'last_7d') {
  const insightsFields = [
    'spend', 'impressions', 'reach', 'frequency', 'clicks', 'ctr', 'cpc', 'cpm',
    'actions', 'action_values', 'cost_per_action_type', 'purchase_roas'
  ].join(',');

  const params: Record<string, string> = {
    fields: `name,status,objective,insights.date_preset(${datePreset}){${insightsFields}}`,
    limit: '100',
  };
  
  if (timeRange) {
    params.fields = `name,status,objective,insights.time_range(${timeRange}){${insightsFields}}`;
  }

  const campaigns = await fetchAllPages(`/${accountId}/campaigns`, params);
  
  return campaigns.map((campaign: any) => {
    const insights = campaign.insights?.data?.[0] || {};
    return {
      campaign_name: campaign.name,
      campaign_id: campaign.id,
      objective: campaign.objective,
      status: campaign.status,
      ...insights
    };
  });
}

export async function getAdInsights(accountId: string, timeRange?: string, datePreset: string = 'last_7d') {
  const params: Record<string, string> = {
    fields: [
      'ad_name', 'ad_id', 'adset_name', 'adset_id', 'campaign_name', 'campaign_id',
      'spend', 'impressions', 'reach', 'frequency', 'clicks', 'ctr', 'cpc', 'cpm',
      'actions', 'action_values', 'cost_per_action_type', 'purchase_roas',
      'quality_ranking', 'engagement_rate_ranking', 'conversion_rate_ranking',
    ].join(','),
    level: 'ad',
    limit: '100',
    filtering: JSON.stringify([{ field: 'ad.effective_status', operator: 'IN', value: ['ACTIVE'] }])
  };

  if (timeRange) params.time_range = timeRange;
  else params.date_preset = datePreset;

  return fetchAllPages(`/${accountId}/insights`, params);
}
