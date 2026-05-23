import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'default';

  // Mocked ad-level insights for Creative Radar
  const mockAds = [
    {
      ad_id: "ad_1001",
      ad_name: "Winner - Hook Dolor Principal",
      campaign_name: "CBO - Escalamiento",
      spend: "1200.50",
      impressions: "45000",
      reach: "38000",
      frequency: "1.18",
      clicks: "1250",
      ctr: "2.77",
      cpc: "0.96",
      cpm: "26.67",
      actions: [{ action_type: 'purchase', value: '45' }],
      purchase_roas: [{ action_type: 'purchase_roas', value: '4.2' }],
      quality_ranking: "ABOVE_AVERAGE"
    },
    {
      ad_id: "ad_1002",
      ad_name: "Fatiga - Video Caos Operativo",
      campaign_name: "CBO - Escalamiento",
      spend: "850.00",
      impressions: "65000",
      reach: "18000",
      frequency: "3.61", // Alto
      clicks: "450",
      ctr: "0.69", // Bajo
      cpc: "1.88",
      cpm: "13.07",
      actions: [{ action_type: 'purchase', value: '5' }],
      purchase_roas: [{ action_type: 'purchase_roas', value: '1.4' }],
      quality_ranking: "AVERAGE"
    },
    {
      ad_id: "ad_1003",
      ad_name: "Dead - Prueba Miedo",
      campaign_name: "ABO - Testing",
      spend: "350.00",
      impressions: "15000",
      reach: "14000",
      frequency: "1.07",
      clicks: "60",
      ctr: "0.40", // Muy bajo
      cpc: "5.83", // Muy alto
      cpm: "23.33",
      actions: [], // Sin compras
      purchase_roas: [],
      quality_ranking: "BELOW_AVERAGE_BOTTOM_10_PERCENT"
    },
    {
      ad_id: "ad_1004",
      ad_name: "Testing - Autoridad V2",
      campaign_name: "ABO - Testing",
      spend: "110.00",
      impressions: "8500",
      reach: "8000",
      frequency: "1.06",
      clicks: "220",
      ctr: "2.58", // Buen CTR temprano
      cpc: "0.50", // Buen CPC temprano
      cpm: "12.94",
      actions: [], // Sin compras aún (Early Signal)
      purchase_roas: [],
      quality_ranking: "AVERAGE"
    }
  ];

  return NextResponse.json({ data: mockAds, slug });
}
