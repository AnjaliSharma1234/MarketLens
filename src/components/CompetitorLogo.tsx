import { useState, useEffect } from 'react';

interface CompetitorLogoProps {
  url?: string;
  name?: string;
}

async function isValidLogoUrl(url?: string) {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function getValidLogoUrl(url: string): Promise<string | null> {
  // Normalize URL and get domain
  const domain = getDomainFromUrl(url);
  
  // Special case for Mesha - try both trymesha.com and mesha.ai
  if (domain.includes('trymesha.com') || domain.includes('mesha.ai')) {
    // Try both domains for maximum compatibility
    const domains = ['trymesha.com', 'mesha.ai'];
    for (const d of domains) {
      const logoUrl = `https://logo.clearbit.com/${d}`;
      const isValid = await isValidLogoUrl(logoUrl);
      if (isValid) {
        return logoUrl;
      }
    }
  }

  // First try Clearbit since it's faster
  try {
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
    const isValid = await isValidLogoUrl(clearbitUrl);
    if (isValid) {
      return clearbitUrl;
    }
  } catch (err) {
    console.warn('Failed to fetch Clearbit logo:', err);
  }

  // If Clearbit fails, try scraping
  try {
    const info = await fetchScrapedCompanyInfo(url);
    if (info.favicon) {
      const resolvedUrl = resolveUrl(url, info.favicon);
      if (resolvedUrl) {
        const isValid = await isValidLogoUrl(resolvedUrl);
        if (isValid) {
          return resolvedUrl;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch scraped logo:', err);
  }
  
  return null;
}

function getDomainFromUrl(url: string) {
  try {
    // Handle special case for Mesha domains
    if (url.includes('trymesha.com')) {
      return 'trymesha.com';
    }
    if (url.includes('mesha.ai')) {
      return 'mesha.ai';
    }
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    // If URL parsing fails, try to extract domain-like string
    const domainMatch = url.match(/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/);
    if (domainMatch) {
      return domainMatch[0];
    }
    return url;
  }
}

function resolveUrl(baseUrl: string, relativeUrl: string): string | null {
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

async function fetchScrapedCompanyInfo(url: string) {
  try {
    const response = await fetch(`/api/scrape-company-info?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch company info');
    return await response.json();
  } catch (err) {
    console.error('Error fetching company info:', err);
    return { title: '', description: '', favicon: null };
  }
}

export function CompetitorLogo({ url, name }: CompetitorLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    let mounted = true;
    const fetchLogo = async () => {
      try {
        const validLogoUrl = await getValidLogoUrl(url);
        if (mounted) {
          setLogoUrl(validLogoUrl);
          setError(!validLogoUrl);
        }
      } catch {
        if (mounted) {
          setError(true);
        }
      }
    };

    fetchLogo();
    return () => { mounted = false; };
  }, [url]);

  if (!url || error || !logoUrl) {
    return (
      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
        {name?.[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      className="w-full h-full object-contain"
      onError={() => setError(true)}
    />
  );
} 