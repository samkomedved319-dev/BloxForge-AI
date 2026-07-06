import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLUGIN_VERSION = "1.0.0";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "plugin",
      "BloxForgeAI.lua",
    );
    const file = await readFile(filePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "text/x-lua; charset=utf-8",
        "Content-Disposition": `attachment; filename="BloxForgeAI.lua"`,
        "Content-Length": file.byteLength.toString(),
        "Cache-Control": "no-store",
        "X-BloxForge-Version": PLUGIN_VERSION,
      },
    });
  } catch (e) {
    console.error("[plugin/download] error:", e);
    return NextResponse.json(
      { error: "Plugin file not available" },
      { status: 500 },
    );
  }
}
