import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getAdInsights, getAdAccounts } from '@/lib/meta/api';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { searchParams } = new URL(request.url);
  let accountId = searchParams.get('accountId');
  const datePreset = searchParams.get('datePreset') || 'last_7d';
  
  const resolvedParams = await context.params;
  const slug = resolvedParams.slug;

  try {
    if (!accountId) {
      // Find the first available account if none passed
      const accounts = await getAdAccounts();
      if (accounts && accounts.length > 0) {
        accountId = accounts[0].id;
      } else {
         return NextResponse.json({ error: 'No Meta ad accounts found. Please configure your Meta integration.' }, { status: 400 });
      }
    }

    // 1. Fetch real ads from Meta Graph API
    const realAds = await getAdInsights(accountId!, undefined, datePreset);

    // 2. Fetch creative packages for this product to establish genealogy
    let packages: any[] | null = [];
    try {
      const { data, error: dbError } = await supabase
        .from('creative_packages')
        .select(`
          id, 
          name, 
          hook_text, 
          meta_ad_id, 
          meta_campaign_id,
          concept:creative_concepts(name),
          landing:landing_variants(name)
        `)
        .eq('product_slug', slug);

      if (dbError) {
        console.error("Error fetching packages, ignoring to keep radar alive:", dbError);
      } else {
        packages = data;
      }
    } catch (dbErr) {
      console.error("Exception fetching packages, ignoring to keep radar alive:", dbErr);
    }

    // Create a map for quick lookup
    const packageByAdId = new Map();
    if (packages) {
      for (const pkg of packages) {
        if (pkg.meta_ad_id) {
          packageByAdId.set(pkg.meta_ad_id, pkg);
        }
      }
    }

    // 3. Merge DB Context with Real Metrics
    const mappedAds = realAds.map((ad: any) => {
      const pkg = packageByAdId.get(ad.ad_id);
      
      return {
        ...ad,
        // Metadata inyectada desde la base de datos (Genealogía)
        creative_package: pkg ? {
          id: pkg.id,
          name: pkg.name,
          hook: pkg.hook_text || ad.ad_name,
          concept: (pkg.concept as any)?.name || 'N/A',
          landing: (pkg.landing as any)?.name || 'N/A'
        } : null
      };
    });

    return NextResponse.json({ data: mappedAds, slug });
  } catch (err: any) {
    console.error("Error fetching radar meta ads:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
