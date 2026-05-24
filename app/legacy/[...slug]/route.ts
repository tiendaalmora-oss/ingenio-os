import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = path.join(process.cwd(), "public", "legacy", ...resolvedParams.slug);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, "utf8");
        return new NextResponse(content, {
          headers: { "Content-Type": "text/html" },
        });
      }
      return new NextResponse("Directory index not found", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "text/plain";
    if (ext === ".html") contentType = "text/html";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".js") contentType = "application/javascript";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".json") contentType = "application/json";

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Error serving legacy file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
