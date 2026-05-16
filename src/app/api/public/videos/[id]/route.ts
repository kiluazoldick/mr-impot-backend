import { NextRequest, NextResponse } from "next/server";
import { VideoService } from "@/lib/services/video.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const video = await VideoService.getById(id);

    if (!video.is_published) {
      return NextResponse.json({ error: "Vidéo non trouvée" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
