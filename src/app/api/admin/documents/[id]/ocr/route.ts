import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Configuration pdfjs pour Node.js
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

const origin = "*";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

async function checkAdmin(request: NextRequest) {
  const accessToken =
    request.cookies.get("sb-access-token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!accessToken) throw new Error("Non authentifié");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) throw new Error("Token invalide");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Non autorisé");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin(request);
    const { id } = await params;

    console.log("🔍 OCR pour document:", id);

    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("file_path, title_fr")
      .eq("id", id)
      .single();

    if (docError || !doc?.file_path) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 },
      );
    }

    console.log("📥 Téléchargement:", doc.file_path);

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("documents")
      .download(doc.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Impossible de télécharger" },
        { status: 500 },
      );
    }

    console.log("📄 Extraction...");
    const buffer = Buffer.from(await fileData.arrayBuffer());

    let ocr_text: string | null = null;
    let ocr_status = "failed";

    try {
      ocr_text = await extractTextFromPdf(buffer);
      ocr_status = ocr_text.length > 0 ? "completed" : "failed";
      console.log(`✅ ${ocr_text.length} caractères extraits`);
    } catch (err: any) {
      console.error("❌ Erreur extraction:", err.message);
    }

    await supabaseAdmin
      .from("documents")
      .update({ ocr_text, ocr_status, updated_at: new Date().toISOString() })
      .eq("id", id);

    console.log("✅ Terminé");

    return NextResponse.json(
      { success: true, ocr_status, text_length: ocr_text?.length || 0 },
      {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}
