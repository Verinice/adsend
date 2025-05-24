// This script populates the MySQL database with dummy data for adsend
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/adsend',
    multipleStatements: true,
  });

  // Create tables if not exist
  await connection.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pages (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64),
      name VARCHAR(255) NOT NULL,
      url VARCHAR(255),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    );
    CREATE TABLE IF NOT EXISTS containers (
      id VARCHAR(64) PRIMARY KEY,
      page_id VARCHAR(64),
      name VARCHAR(255) NOT NULL,
      FOREIGN KEY (page_id) REFERENCES pages(id)
    );
    CREATE TABLE IF NOT EXISTS banners (
      id VARCHAR(64) PRIMARY KEY,
      property_id VARCHAR(64),
      container_id VARCHAR(64),
      ad_html TEXT NOT NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (container_id) REFERENCES containers(id)
    );
  `);

  // Insert dummy property
  await connection.query(`INSERT IGNORE INTO properties (id, name) VALUES (?, ?)`, [
    '1747848736180-2uu8qa',
    'Ad Dashboard',
  ]);

  // Insert dummy page
  await connection.query(`INSERT IGNORE INTO pages (id, property_id, name, url) VALUES (?, ?, ?, ?)`, [
    'page-1',
    '1747848736180-2uu8qa',
    'Demo Page',
    'https://example.com/page',
  ]);

  // Insert dummy containers
  await connection.query(`INSERT IGNORE INTO containers (id, page_id, name) VALUES (?, ?, ?)`, [
    'container-1',
    'page-1',
    '.ad-slot',
  ]);
  await connection.query(`INSERT IGNORE INTO containers (id, page_id, name) VALUES (?, ?, ?)`, [
    'container-2',
    'page-1',
    '#main-banner',
  ]);

  // Insert dummy banners
  await connection.query(`INSERT IGNORE INTO banners (id, property_id, container_id, ad_html) VALUES (?, ?, ?, ?)`, [
    'banner-1',
    '1747848736180-2uu8qa',
    'container-1',
    '<a href="https://example.com"><img src="https://via.placeholder.com/300x250" alt="Ad" /></a>',
  ]);
  await connection.query(`INSERT IGNORE INTO banners (id, property_id, container_id, ad_html) VALUES (?, ?, ?, ?)`, [
    'banner-2',
    '1747848736180-2uu8qa',
    'container-2',
    '<a href="https://example.com"><img src="https://via.placeholder.com/728x90" alt="Ad" /></a>',
  ]);

  await connection.end();
  console.log('Dummy data inserted successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
