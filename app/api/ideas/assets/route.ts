import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function POST(request: Request) {
  try {
    const { inserts } = await request.json();
    
    if (!inserts || inserts.length === 0) {
      return NextResponse.json({ success: false, error: "No inserts provided" }, { status: 400 });
    }

    const { data, error } = await supabase.from("pve_creative_assets").insert(inserts);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
