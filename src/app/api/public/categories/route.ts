import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/lib/services/category.service";

export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get("parent_id");
    const categories = await CategoryService.getAll(true);

    // Filtrer par parent si demandé
    let result = categories;
    if (parentId) {
      result = categories.filter((cat: any) => cat.parent_id === parentId);
    } else if (parentId === "null") {
      result = categories.filter((cat: any) => cat.parent_id === null);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
