import fs from 'fs';
import path from 'path';
import Posts from '../models/Posts.js';

export async function generateSitemap() {
  const site = (process.env.FRONTEND_URL || '').replace(/\/$/, '') || 'http://localhost:3000';
  const posts = await Posts.find({ status: true, approved: true }).select('slug updatedAt createdAt').sort({ updatedAt: -1 }).lean();

  const urls = posts.map(p => `  <url>\n    <loc>${site}/${p.slug}/${p._id}</loc>\n    <lastmod>${(p.updatedAt || p.createdAt).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}</loc>\n    <priority>1.0</priority>\n  </url>\n${urls}\n</urlset>`;

  const outDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'sitemap.xml');
  fs.writeFileSync(out, xml, 'utf8');
  return out;
}
