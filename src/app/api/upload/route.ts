import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// POST /api/upload - handle banner image upload
export async function POST(req: Request) {
  // Use the built-in formData API for binary-safe file uploads
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const propertyId = formData.get("propertyId") as string;

  if (!file || !propertyId) {
    return NextResponse.json({ error: "Missing file or propertyId" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = path.join(process.cwd(), "public", "uploads", propertyId);
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  await fs.writeFile(filePath, buffer);

  const fileUrl = `/uploads/${propertyId}/${file.name}`;
  return NextResponse.json({ url: fileUrl });
}
