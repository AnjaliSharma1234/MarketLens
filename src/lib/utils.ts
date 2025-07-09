import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid URL (http/https, domain, optional path).
 * Requires at least one dot in the hostname and a valid TLD (2-24 letters).
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(normalized);
    // Hostname must have at least one dot and a valid TLD
    // e.g., example.com, www.example.com, sub.domain.co.uk
    const hostname = u.hostname;
    // Regex: at least one dot, ends with .tld (2-24 letters)
    if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,24}$/.test(hostname)) {
      return false;
    }
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fetches company info for a given URL using only Clearbit and user input.
 * Returns { name, description, logo }.
 */
export async function fetchCompanyInfo(url: string): Promise<{ name?: string; description?: string; logo?: string } | null> {
  try {
    // Use the domain as the name, Clearbit for logo
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(normalized);
    const domain = u.hostname;
    return {
      name: domain,
      description: '',
      logo: `https://logo.clearbit.com/${domain}`
    };
  } catch {
    return null;
  }
}

/**
 * Extracts and parses the first valid JSON object from a string
 * Handles incomplete/truncated JSON and cleans up common issues
 */
export function extractJsonFromString(str: string): any | null {
  try {
    // First try: direct parse if it's already valid JSON
    try {
      return JSON.parse(str);
    } catch {}

    // Second try: find the first JSON-like structure
    let depth = 0, start = -1, end = -1;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }

    if (start === -1 || end === -1) return null;

    // Extract the potential JSON string
    let jsonString = str.slice(start, end);

    // Clean up common issues
    jsonString = jsonString
      // Remove trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, '$1')
      // Remove any markdown code block syntax
      .replace(/```json\n?|\n?```/g, '')
      // Normalize quotes
      .replace(/[""]/g, '"')
      // Remove any non-JSON text after the last closing brace
      .replace(/}[^}]*$/, '}');

    // Try to parse the cleaned string
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON after cleanup:', e);
      return null;
    }
  } catch (e) {
    console.error('Error in extractJsonFromString:', e);
    return null;
  }
}
