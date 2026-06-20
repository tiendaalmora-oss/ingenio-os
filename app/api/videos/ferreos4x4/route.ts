import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const videoPath = path.join(process.cwd(), 'public', 'videos', 'ferreos4x4.mp4');
    
    if (!fs.existsSync(videoPath)) {
      return new NextResponse("Video not found at " + videoPath, { status: 404 });
    }

    const stat = fs.statSync(videoPath);
    const fileStream = fs.createReadStream(videoPath);
    
    // @ts-ignore
    return new NextResponse(fileStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size.toString(),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
