import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Use the CLOUDINARY_URL from .env.local automatically
cloudinary.config();

export const runtime = "nodejs";

// POST /api/upload - handle banner image upload
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const propertyId = formData.get("propertyId") as string;

  if (!file || !propertyId) {
    return NextResponse.json({ error: "Missing file or propertyId" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Cloudinary
  try {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `adsend/${propertyId}`,
          resource_type: "image",
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    const fileUrl = uploadResult.secure_url;
    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
  }
}
