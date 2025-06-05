import { writeFile, mkdir } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    // Criar diretório temp se não existir
    const publicDir = path.join(process.cwd(), "public");
    const tempDir = path.join(publicDir, "temp");

    // Garantir que tanto public quanto temp existam
    if (!fs.existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }
    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Baixar imagem
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Gerar nome único para o arquivo
    const fileName = `campaign_${Date.now()}.jpg`;
    const filePath = path.join(tempDir, fileName);

    // Salvar arquivo
    await writeFile(filePath, uint8Array);

    // Verificar se o arquivo foi criado
    if (!fs.existsSync(filePath)) {
      throw new Error("Falha ao salvar arquivo");
    }

    console.log("Arquivo salvo em:", filePath);

    return NextResponse.json({
      success: true,
      filePath: `/temp/${fileName}`,
    });
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao baixar imagem",
      },
      { status: 500 }
    );
  }
}
