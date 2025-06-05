import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();
    const fullPath = path.join(process.cwd(), "public", filePath);

    await unlink(fullPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao limpar arquivo temporário:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao limpar arquivo",
      },
      { status: 500 }
    );
  }
}
