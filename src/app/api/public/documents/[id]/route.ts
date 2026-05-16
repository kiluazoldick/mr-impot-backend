import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/services/document.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const download = request.nextUrl.searchParams.get("download") === "true";

    if (download) {
      const signedUrl = await DocumentService.download(id);
      return NextResponse.json({ url: signedUrl });
    }

    const document = await DocumentService.getById(id);

    // Vérifier que le document est publié
    if (!document.is_published) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
