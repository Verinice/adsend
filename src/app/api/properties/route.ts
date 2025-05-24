import { NextResponse } from "next/server";
const mysql = require('mysql2/promise');

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });
}

// POST /api/properties - create a new property
export async function POST(req) {
  const { name, id } = await req.json();
  if (!name || !id) {
    return NextResponse.json({ error: 'Missing name or id' }, { status: 400 });
  }
  const conn = await getConnection();
  await conn.query('INSERT INTO properties (id, name) VALUES (?, ?)', [id, name]);
  await conn.end();
  return NextResponse.json({ success: true });
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
