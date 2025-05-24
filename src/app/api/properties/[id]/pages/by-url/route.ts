import { NextResponse } from "next/server";
const mysql = require("mysql2/promise");

async function getConnection() {
  return await mysql.createConnection({
    uri: process.env.DATABASE_URL || "mysql://root:root@localhost:3306/adsend",
    multipleStatements: true,
  });
}

// GET /api/properties/[id]/pages/by-url?url=...
export async function GET(req: Request, context: { params: { id: string } }) {
  const { id: propertyId } = context.params;
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const withBanners = searchParams.get("withBanners");
  if (!propertyId || !url) {
    return NextResponse.json({ error: "Missing propertyId or url" }, { status: 400 });
  }
  const conn = await getConnection();
  // Try exact match on full URL
  let [pages] = await conn.query(
    "SELECT * FROM pages WHERE property_id = ? AND url = ? LIMIT 1",
    [propertyId, url]
  );
  let page = pages[0];
  // If not found, try endsWith match (for flexible routing)
  if (!page) {
    const [altPages] = await conn.query(
      "SELECT * FROM pages WHERE property_id = ?",
      [propertyId]
    );
    // Try endsWith on full URL
    page = altPages.find((p: any) => url.endsWith(p.url));
    // If still not found, try matching just the pathname
    if (!page) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        page = altPages.find((p: any) => pathname === p.url || pathname.endsWith(p.url));
      } catch {}
    }
  }
  if (!page) {
    await conn.end();
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  // Get containers for this page
  const [containers] = await conn.query(
    "SELECT id, name FROM containers WHERE page_id = ?",
    [page.id]
  );
  if (withBanners === 'route') {
    // Return a single random banner's adHtml as base64-encoded text
    const [bannerRows] = await conn.query(
      "SELECT ad_html FROM banners WHERE property_id = ? ORDER BY RAND() LIMIT 1",
      [propertyId]
    );
    await conn.end();
    if (bannerRows.length > 0 && bannerRows[0].ad_html) {
      const base64 = Buffer.from(bannerRows[0].ad_html, 'utf-8').toString('base64');
      return new Response(base64, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    } else {
      return new Response('', { status: 204 });
    }
  }
  let banners = [];
  if (withBanners) {
    // Get all banners for this property
    const [bannerRows] = await conn.query(
      "SELECT * FROM banners WHERE property_id = ?",
      [propertyId]
    );
    banners = bannerRows;
  }
  await conn.end();
  return NextResponse.json({ ...page, containers, banners });
}
