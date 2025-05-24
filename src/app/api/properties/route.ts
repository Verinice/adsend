import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
const mysql = require("mysql2/promise");

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || "mysql://root:root@localhost:3306/adsend",
    multipleStatements: true,
  });
}

// POST /api/properties - create a new property
export async function POST(req: Request) {
  const { id, name } = await req.json();
  if (!id || !name) {
    return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
  }
  const conn = await getConnection();
  // Only insert if this property name is not already present
  const [existing] = await conn.query("SELECT id FROM properties WHERE name = ?", [name]);
  if (existing.length === 0) {
    await conn.query("INSERT INTO properties (id, name) VALUES (?, ?)", [id, name]);
    await conn.end();
    // Create uploads directory for this property (async/await)
    const uploadDir = path.join(process.cwd(), "public", "uploads", id);
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // If directory creation fails, still return success for property creation
    }
    return NextResponse.json({ success: true });
  } else {
    await conn.end();
    return NextResponse.json({ error: "Duplicate property name" }, { status: 409 });
  }
}

// DELETE /api/properties/[id] - delete a property and its uploads folder
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }
  const conn = await getConnection();
  try {
    // Delete property from DB (and cascade as needed)
    await conn.query("DELETE FROM properties WHERE id = ?", [propertyId]);
    await conn.end();
    // Remove uploads directory for this property
    const uploadDir = path.join(process.cwd(), "public", "uploads", propertyId);
    try {
      await fs.rm(uploadDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore if directory does not exist or cannot be deleted
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    await conn.end();
    let message = "Unknown error";
    if (err && typeof err === "object" && "message" in err) {
      message = (err as any).message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/properties - fetch all properties with nested pages, containers, and banners
export async function GET(req: Request) {
  const conn = await getConnection();
  // Fetch all properties
  const [properties] = await conn.query('SELECT * FROM properties');
  // Fetch all pages
  const [pages] = await conn.query('SELECT * FROM pages');
  // Fetch all containers
  const [containers] = await conn.query('SELECT * FROM containers');
  // Fetch all banners
  const [banners] = await conn.query('SELECT * FROM banners');

  // Nest containers into pages
  const pagesWithContainers = pages.map((page: any) => ({
    ...page,
    containers: containers
      .filter((container: any) => container.page_id === page.id)
      .map((container: any) => ({
        ...container,
        banners: banners.filter((banner: any) => banner.container_id === container.id),
      })),
  }));

  // Nest pages into properties
  const propertiesWithPages = properties.map((property: any) => ({
    ...property,
    pages: pagesWithContainers.filter((page: any) => page.property_id === property.id),
  }));

  await conn.end();
  return NextResponse.json({ properties: propertiesWithPages });
}
