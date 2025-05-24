import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// POST /api/pages/[id]/containers - create a new container for a page
export async function POST(req: Request, context: { params: { id: string } }) {
  const { id: pageId } = context.params;
  let { containerId, name } = await req.json();
  if (!pageId || !containerId || !name) {
    return NextResponse.json({ error: 'Missing pageId, containerId, or name' }, { status: 400 });
  }
  // Always preserve the original selector (do not strip # or .)
  // Normalize: trim and keep as-is
  name = name.trim();
  const conn = await getConnection();
  // Only insert if this selector is not already present for this page (case-sensitive, exact match)
  const [existing] = await conn.query('SELECT id FROM containers WHERE page_id = ? AND name = ?', [pageId, name]);
  if (existing.length === 0) {
    await conn.query('INSERT INTO containers (id, page_id, name) VALUES (?, ?, ?)', [containerId, pageId, name]);
    await conn.end();
    return NextResponse.json({ success: true });
  } else {
    await conn.end();
    return NextResponse.json({ error: 'Duplicate container/selector for this page' }, { status: 409 });
  }
}

// GET /api/pages/[id]/containers - get all unique containers for a page
export async function GET(req: Request, context: { params: { id: string } }) {
  const { id: pageId } = context.params;
  if (!pageId) {
    return NextResponse.json({ error: 'Missing pageId' }, { status: 400 });
  }
  const conn = await getConnection();
  // Only return unique container names for this page (case-sensitive, exact match)
  const [rows] = await conn.query('SELECT MIN(id) as id, name FROM containers WHERE page_id = ? GROUP BY name', [pageId]);
  await conn.end();
  return NextResponse.json({ containers: rows });
}

// DELETE /api/pages/[id]/containers - delete a container and its banners
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id: pageId } = context.params;
  const { containerId } = await req.json();
  if (!pageId || !containerId) {
    return NextResponse.json({ error: 'Missing pageId or containerId' }, { status: 400 });
  }
  const conn = await getConnection();
  // Delete all banners for this container
  await conn.query('DELETE FROM banners WHERE container_id = ?', [containerId]);
  // Delete the container
  await conn.query('DELETE FROM containers WHERE id = ? AND page_id = ?', [containerId, pageId]);
  await conn.end();
  return NextResponse.json({ success: true });
}

// PUT /api/pages/[id]/containers - update a container (e.g., name)
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id: pageId } = context.params;
  const { containerId, name } = await req.json();
  if (!pageId || !containerId || !name) {
    return NextResponse.json({ error: 'Missing pageId, containerId, or name' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('UPDATE containers SET name = ? WHERE id = ? AND page_id = ?', [name, containerId, pageId]);
  await conn.end();
  return NextResponse.json({ success: true });
}
