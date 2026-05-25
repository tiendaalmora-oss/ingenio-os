import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathArray = resolvedParams.path;
    if (!filePathArray || filePathArray.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // El archivo físico está guardado en public/assets/...
    const physicalPath = path.join(process.cwd(), "public", "assets", ...filePathArray);

    if (!fs.existsSync(physicalPath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(physicalPath);
    const ext = path.extname(physicalPath).toLowerCase();
    
    let contentType = "application/octet-stream";
    if (ext === ".png") contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".gif") contentType = "image/gif";
    if (ext === ".svg") contentType = "image/svg+xml";
    if (ext === ".webp") contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    console.error("Error serving media:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
