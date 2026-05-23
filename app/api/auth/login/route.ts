import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    const correctPassword = process.env.DASHBOARD_PASSWORD || "ingenio2026";

    if (password === correctPassword) {
      // Set secure HTTP-only cookie
      (await cookies()).set({
        name: "ingenio_session",
        value: correctPassword,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Contraseña incorrecta." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Ocurrió un error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
