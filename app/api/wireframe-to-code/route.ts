import { db } from "@/configs/db";
import { WireframeToCodeTable } from "@/configs/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { description, imageUrl, model, uid, email } = await req.json();

  const result = await db
    .insert(WireframeToCodeTable)
    .values({
      uid: uid,
      description: description,
      imageUrl: imageUrl,
      model: model,
      createdBy: email,
    })
    .returning({ id: WireframeToCodeTable.id });

  return NextResponse.json({ result });
}
