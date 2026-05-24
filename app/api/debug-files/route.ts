import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const cwd = process.cwd();
    const publicPath = path.join(cwd, "public");
    const legacyPath = path.join(publicPath, "legacy");

    const debugInfo = {
      cwd,
      publicExists: fs.existsSync(publicPath),
      legacyExists: fs.existsSync(legacyPath),
      legacyContents: [] as any[],
    };

    if (debugInfo.legacyExists) {
      const projects = fs.readdirSync(legacyPath);
      for (const p of projects) {
        const pPath = path.join(legacyPath, p);
        const isDir = fs.statSync(pPath).isDirectory();
        if (isDir) {
          const contents = fs.readdirSync(pPath);
          debugInfo.legacyContents.push({
            project: p,
            contents,
          });
        } else {
          debugInfo.legacyContents.push({
            file: p,
          });
        }
      }
    }

    return NextResponse.json({ success: true, debug: debugInfo });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
