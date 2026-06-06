import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wahaUrl = process.env.WAHA_URL || "http://localhost:3000";
    const apiKey = process.env.WAHA_API_KEY || "NO_KEY";
    
    // Test basic connectivity to WAHA
    const start = Date.now();
    const res = await fetch(`${wahaUrl}/api/sessions?all=true`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(process.env.WAHA_API_KEY ? { "X-Api-Key": process.env.WAHA_API_KEY } : {})
      }
    });
    
    const time = Date.now() - start;
    const text = await res.text();
    
    return NextResponse.json({ 
      success: true, 
      wahaUrl, 
      hasApiKey: apiKey !== "NO_KEY",
      status: res.status,
      timeMs: time,
      response: text.substring(0, 500)
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      wahaUrl: process.env.WAHA_URL,
      error: err.message 
    }, { status: 500 });
  }
}
