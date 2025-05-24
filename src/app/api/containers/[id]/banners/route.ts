import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// POST /api/containers/[id]/banners - create a new banner for a container
export async function POST(req, { params }) {
  const { id: containerId } = params;
  const { bannerId, propertyId, ad_html } = await req.json();
  if (!containerId || !bannerId || !propertyId || !ad_html) {
    return NextResponse.json({ error: 'Missing containerId, bannerId, propertyId, or ad_html' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('INSERT INTO banners (id, property_id, container_id, ad_html) VALUES (?, ?, ?, ?)', [bannerId, propertyId, containerId, ad_html]);
  await conn.end();
  return NextResponse.json({ success: true });
}

// GET /api/containers/[id]/banners - get all banners for a container
export async function GET(req: Request, context: { params: { id: string } }) {
  const { id: containerId } = context.params;
  if (!containerId) {
    return NextResponse.json({ error: 'Missing containerId' }, { status: 400 });
  }
  const conn = await getConnection();
  const [rows] = await conn.query('SELECT * FROM banners WHERE container_id = ?', [containerId]);
  await conn.end();
  return NextResponse.json({ banners: rows });
}

// DELETE /api/containers/[id]/banners - delete a banner by id
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id: containerId } = context.params;
  const { bannerId } = await req.json();
  if (!containerId || !bannerId) {
    return NextResponse.json({ error: 'Missing containerId or bannerId' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('DELETE FROM banners WHERE id = ? AND container_id = ?', [bannerId, containerId]);
  await conn.end();
  return NextResponse.json({ success: true });
}

// PUT /api/containers/[id]/banners - update a banner (e.g., targetUrl, ad_html)
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id: containerId } = context.params;
  const { bannerId, targetUrl, ad_html } = await req.json();
  if (!containerId || !bannerId) {
    return NextResponse.json({ error: 'Missing containerId or bannerId' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('UPDATE banners SET target_url = ?, ad_html = ? WHERE id = ? AND container_id = ?', [targetUrl || '', ad_html || '', bannerId, containerId]);
  await conn.end();
  return NextResponse.json({ success: true });
}
