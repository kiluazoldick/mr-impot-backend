import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/services/document.service";
import { documentSchema } from "@/lib/validations/document";

const origin = "*";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const download = request.nextUrl.searchParams.get("download") === "true";

    if (download) {
      const signedUrl = await DocumentService.download(id);
      return NextResponse.json(
        { url: signedUrl },
        {
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
          },
        },
      );
    }

    const document = await DocumentService.getById(id);
    return NextResponse.json(document, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    let body: any = {};
    let file: File | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const dataStr = formData.get("data") as string;
      if (dataStr) {
        body = JSON.parse(dataStr);
      }
      file = (formData.get("file") as File) || undefined;
    } else {
      body = await request.json();
    }

    const validated = documentSchema.partial().parse(body);
    const document = await DocumentService.update(id, validated, file);

    return NextResponse.json(document, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error: any) {
    console.error("PUT document error:", error.message);
    return NextResponse.json(
      { error: error.message },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await DocumentService.delete(id);
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
  } catch (error: any) {
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
