import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// DELETE /api/properties/[id] - delete a property and all its pages, containers, and banners
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  if (!propertyId) {
    return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
  }
  const conn = await getConnection();
  try {
    // 1. Find all pages for this property
    const [pages]: [Array<{ id: string }>] = await conn.query('SELECT id FROM pages WHERE property_id = ?', [propertyId]);
    const pageIds = pages.map((p: { id: string }) => p.id);
    if (pageIds.length > 0) {
      // 2. Find all containers for these pages
      const [containers]: [Array<{ id: string }>] = await conn.query('SELECT id FROM containers WHERE page_id IN (?)', [pageIds]);
      const containerIds = containers.map((c: { id: string }) => c.id);
      if (containerIds.length > 0) {
        // 3. Delete all banners for these containers
        await conn.query('DELETE FROM banners WHERE container_id IN (?)', [containerIds]);
        // 4. Delete all containers
        await conn.query('DELETE FROM containers WHERE id IN (?)', [containerIds]);
      }
      // 5. Delete all pages
      await conn.query('DELETE FROM pages WHERE id IN (?)', [pageIds]);
    }
    // 6. Delete all property-level banners
    await conn.query('DELETE FROM banners WHERE property_id = ?', [propertyId]);
    // 7. Delete the property itself
    await conn.query('DELETE FROM properties WHERE id = ?', [propertyId]);
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
