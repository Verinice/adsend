import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// POST /api/properties/[id]/pages - create a new page for a property
export async function POST(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { pageId, name, url } = await req.json();
  if (!propertyId || !pageId || !name) {
    return NextResponse.json({ error: 'Missing propertyId, pageId, or name' }, { status: 400 });
  }
  const conn = await getConnection();
  // Only insert if this page name or url is not already present for this property
  const [existing] = await conn.query('SELECT id FROM pages WHERE property_id = ? AND (name = ? OR url = ?)', [propertyId, name, url]);
  if (existing.length === 0) {
    await conn.query('INSERT INTO pages (id, property_id, name, url) VALUES (?, ?, ?, ?)', [pageId, propertyId, name, url || null]);
    await conn.end();
    return NextResponse.json({ success: true });
  } else {
    await conn.end();
    return NextResponse.json({ error: 'Duplicate page name or url for this property' }, { status: 409 });
  }
}

// GET /api/properties/[id]/pages - fetch all unique pages for a property
export async function GET(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  if (!propertyId) {
    return NextResponse.json({ pages: [] });
  }
  const conn = await getConnection();
  // Only return unique page names/urls for this property
  const [rows] = await conn.query('SELECT MIN(id) as id, name, url FROM pages WHERE property_id = ? GROUP BY name, url', [propertyId]);
  await conn.end();
  return NextResponse.json({ pages: rows });
}

// DELETE /api/properties/[id]/pages - delete a page and all its containers and banners
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { pageId } = await req.json();
  if (!propertyId || !pageId) {
    return NextResponse.json({ error: 'Missing propertyId or pageId' }, { status: 400 });
  }
  const conn = await getConnection();
  try {
    // 1. Find all containers for this page
    const [containers]: [Array<{ id: string }>] = await conn.query('SELECT id FROM containers WHERE page_id = ?', [pageId]);
    const containerIds = containers.map((c: { id: string }) => c.id);
    if (containerIds.length > 0) {
      // 2. Delete all banners for these containers
      await conn.query('DELETE FROM banners WHERE container_id IN (?)', [containerIds]);
      // 3. Delete all containers for this page
      await conn.query('DELETE FROM containers WHERE page_id = ?', [pageId]);
    }
    // 4. Delete the page itself
    await conn.query('DELETE FROM pages WHERE id = ? AND property_id = ?', [pageId, propertyId]);
    await conn.end();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    await conn.end();
    let message = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as any).message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/properties/[id]/pages - update a page's name and url
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { pageId, name, url } = await req.json();
  if (!propertyId || !pageId || !name) {
    return NextResponse.json({ error: 'Missing propertyId, pageId, or name' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('UPDATE pages SET name = ?, url = ? WHERE id = ? AND property_id = ?', [name, url, pageId, propertyId]);
  await conn.end();
  return NextResponse.json({ success: true });
}
