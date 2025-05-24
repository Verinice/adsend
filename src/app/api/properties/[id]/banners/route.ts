import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// POST /api/properties/[id]/banners - create a new banner for a property
export async function POST(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { bannerId, ad_html, imageUrl, name } = await req.json();
  if (!propertyId || !bannerId || !ad_html || !imageUrl || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('INSERT INTO banners (id, property_id, ad_html, imageUrl, name) VALUES (?, ?, ?, ?, ?)', [bannerId, propertyId, ad_html, imageUrl, name]);
  await conn.end();
  return NextResponse.json({ success: true });
}

// GET /api/properties/[id]/banners - return a random banner adHtml as text/html, or all as JSON if ?json=1
export async function GET(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { searchParams } = new URL(req.url);
  const asJson = searchParams.get('json');
  const conn = await getConnection();
  if (asJson) {
    // Return all banners as JSON
    const [banners] = await conn.query('SELECT * FROM banners WHERE property_id = ?', [propertyId]);
    await conn.end();
    return NextResponse.json({ banners });
  } else {
    // Return a single random banner's adHtml as text/html
    const [banners] = await conn.query('SELECT ad_html FROM banners WHERE property_id = ? ORDER BY RAND() LIMIT 1', [propertyId]);
    await conn.end();
    if (banners.length > 0 && banners[0].ad_html) {
      return new Response(banners[0].ad_html, { status: 200, headers: { 'Content-Type': 'text/html' } });
    } else {
      return new Response('', { status: 204 });
    }
  }
}

// DELETE /api/properties/[id]/banners - delete a banner for a property
export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { bannerId } = await req.json();
  if (!propertyId || !bannerId) {
    return NextResponse.json({ error: 'Missing propertyId or bannerId' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('DELETE FROM banners WHERE id = ? AND property_id = ?', [bannerId, propertyId]);
  await conn.end();
  return NextResponse.json({ success: true });
}

// PUT /api/properties/[id]/banners - update a banner (e.g., targetUrl, ad_html)
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { bannerId, targetUrl, adHtml } = await req.json();
  if (!propertyId || !bannerId) {
    return NextResponse.json({ error: 'Missing propertyId or bannerId' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('UPDATE banners SET ad_html = ?, targetUrl = ? WHERE id = ? AND property_id = ?', [adHtml || '', targetUrl || '', bannerId, propertyId]);
  await conn.end();
  return NextResponse.json({ success: true });
}