import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONTENT_TYPES: Record<string, string> = {
  // Images
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  // Videos
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/avi",
};

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

    const ext = path.extname(physicalPath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    const isVideo = contentType.startsWith("video/");

    // ─── VIDEO: HTTP Range Requests (streaming parcial, igual que YouTube) ──────
    if (isVideo) {
      const stat = fs.statSync(physicalPath);
      const fileSize = stat.size;
      const rangeHeader = req.headers.get("range");

      if (rangeHeader) {
        // Parsear el header Range: bytes=START-END
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Seguridad: no exceder el tamaño del archivo
        const chunkEnd = Math.min(end, fileSize - 1);
        const chunkSize = chunkEnd - start + 1;

        const fileStream = fs.createReadStream(physicalPath, { start, end: chunkEnd });

        // Convertir el ReadStream de Node a un ReadableStream de la Web API
        const webStream = new ReadableStream({
          start(controller) {
            fileStream.on("data", (chunk) => controller.enqueue(chunk));
            fileStream.on("end", () => controller.close());
            fileStream.on("error", (err) => controller.error(err));
          },
          cancel() {
            fileStream.destroy();
          },
        });

        return new NextResponse(webStream, {
          status: 206, // Partial Content
          headers: {
            "Content-Type": contentType,
            "Content-Range": `bytes ${start}-${chunkEnd}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunkSize),
            "Cache-Control": "public, max-age=86400",
          },
        });
      }

      // Sin Range header: devolver el video completo (con Accept-Ranges para que el browser sepa que puede hacer range requests)
      const fileStream = fs.createReadStream(physicalPath);
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(webStream, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Content-Length": String(fileSize),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // ─── IMAGEN: Respuesta simple con caché largo ────────────────────────────────
    const fileBuffer = fs.readFileSync(physicalPath);
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
