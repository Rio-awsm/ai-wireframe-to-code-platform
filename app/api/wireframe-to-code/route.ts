import { db } from "@/configs/db";
import { WireframeToCodeTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
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

export async function GET(req: NextResponse) {
  const reqUrl = req.url;
  const { searchParams } = new URL(reqUrl);
  const uid = searchParams?.get("uid");
  const email = searchParams?.get("email");
  if (uid) {
    const result = await db
      .select()
      .from(WireframeToCodeTable)
      .where(eq(WireframeToCodeTable.uid, uid));
    return NextResponse.json(result[0]);
  }
  else if (email) {
    const result = await db
      .select()
      .from(WireframeToCodeTable)
      .where(eq(WireframeToCodeTable.createdBy, email));
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "No record found!!" });
}

export async function PUT(req: NextRequest) {
  const { uid, codeResp } = await req.json();
  const result = await db
    .update(WireframeToCodeTable)
    .set({ code: codeResp })
    .where(eq(WireframeToCodeTable.uid, uid))
    .returning({ uid: WireframeToCodeTable.uid });

  return NextResponse.json(result);
}
