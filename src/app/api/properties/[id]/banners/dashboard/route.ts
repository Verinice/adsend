import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// GET /api/properties/[id]/banners/dashboard - get all banners for a property (dashboard JSON)
export async function GET(req, { params }) {
  const { id: propertyId } = params;
  if (!propertyId) {
    return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
  }
  const conn = await getConnection();
  const [rows] = await conn.query('SELECT * FROM banners WHERE property_id = ?', [propertyId]);
  await conn.end();
  return NextResponse.json({ banners: rows }, { status: 200 });
}
