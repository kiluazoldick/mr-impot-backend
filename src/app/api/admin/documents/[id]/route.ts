import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/services/document.service";
import { documentSchema } from "@/lib/validations/document";

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
    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const body = JSON.parse(formData.get("data") as string);
    const file = formData.get("file") as File | null;

    const validated = documentSchema.partial().parse(body);
    const document = await DocumentService.update(
      id,
      validated,
      file || undefined,
    );
    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await DocumentService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
