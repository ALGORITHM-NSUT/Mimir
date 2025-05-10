import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for `__dirname` in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://mimir-gamma.vercel.app';

const routes = ['/', '/login', '/new'];

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

fs.writeFileSync(path.resolve(__dirname, 'public', 'sitemap.xml'), sitemapContent);

console.log('✅ Sitemap generated!');
