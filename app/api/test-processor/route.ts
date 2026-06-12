import { NextResponse } from "next/server";
import { executeAIForContact } from "@/lib/ai/processor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" });
  
  try {
    const result = await executeAIForContact(id);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
