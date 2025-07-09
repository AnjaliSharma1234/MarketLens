const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const router = express.Router();

// Helper to resolve relative URLs
function resolveUrl(baseUrl, relativeUrl) {
  if (!relativeUrl) return null;
  try {
    // If it's already an absolute URL, return it
    new URL(relativeUrl);
    return relativeUrl;
  } catch {
    // If it's a relative URL, resolve it against the base URL
    try {
      const base = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
      // Handle protocol-relative URLs
      if (relativeUrl.startsWith('//')) {
        return `${base.protocol}${relativeUrl}`;
      }
      // Handle root-relative URLs
      if (relativeUrl.startsWith('/')) {
        return `${base.origin}${relativeUrl}`;
      }
      // Handle relative URLs
      return new URL(relativeUrl, base.origin).href;
    } catch {
      return null;
    }
  }
}

router.post('/api/scrape-company-info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const baseUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(baseUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Try to find the logo in order of preference
    let logo = null;
    const possibleLogoSelectors = [
      // High quality logos
      'link[rel="apple-touch-icon"][sizes="180x180"]',
      'link[rel="apple-touch-icon"][sizes="152x152"]',
      'link[rel="apple-touch-icon"][sizes="144x144"]',
      'link[rel="apple-touch-icon"][sizes="120x120"]',
      'link[rel="apple-touch-icon"]',
      // Open Graph and Twitter images
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      // Standard favicons
      'link[rel="icon"][type="image/svg+xml"]',
      'link[rel="icon"][type="image/png"]',
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="favicon"]'
    ];

    for (const selector of possibleLogoSelectors) {
      const element = $(selector).first();
      const logoUrl = element.attr('href') || element.attr('content');
      if (logoUrl) {
        const resolvedUrl = resolveUrl(baseUrl, logoUrl);
        if (resolvedUrl) {
          // Verify the logo URL is accessible
          try {
            const logoResponse = await fetch(resolvedUrl, { method: 'HEAD' });
            if (logoResponse.ok) {
              logo = resolvedUrl;
              break;
            }
          } catch {
            // Continue to next selector if this URL fails
            continue;
          }
        }
      }
    }

    // If no logo found, try the default favicon.ico location
    if (!logo) {
      try {
        const domain = new URL(baseUrl).origin;
        const faviconUrl = `${domain}/favicon.ico`;
        const faviconResponse = await fetch(faviconUrl, { method: 'HEAD' });
        if (faviconResponse.ok) {
          logo = faviconUrl;
        }
      } catch {
        // Ignore favicon.ico errors
      }
    }

    res.json({
      title,
      description,
      favicon: logo,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch or parse website', details: err.message });
  }
});

module.exports = router; 