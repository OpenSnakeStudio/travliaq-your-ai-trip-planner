/**
 * Security Utilities - XSS protection, sanitization, and safe encoding
 *
 * CRITICAL: These utilities must be used for any user-generated content
 * that will be rendered as HTML or used in URLs/filenames.
 */

/**
 * HTML entity mapping for escaping
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Regex for HTML special characters
 */
const HTML_ESCAPE_REGEX = /[&<>"'`=/]/g;

/**
 * Escape HTML special characters to prevent XSS
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string | null | undefined): string {
  if (text == null) return "";
  return String(text).replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Escape for use in HTML attributes (more strict)
 */
export function escapeHtmlAttribute(text: string | null | undefined): string {
  if (text == null) return "";
  // First escape HTML, then encode any remaining special chars
  return escapeHtml(text)
    .replace(/\n/g, "&#10;")
    .replace(/\r/g, "&#13;")
    .replace(/\t/g, "&#9;");
}

/**
 * iCal special characters that need escaping
 */
const ICAL_ESCAPE_CHARS: Array<[RegExp, string]> = [
  [/\\/g, "\\\\"],
  [/;/g, "\\;"],
  [/,/g, "\\,"],
  [/\n/g, "\\n"],
  [/\r/g, ""],
];

/**
 * Escape text for iCal format
 *
 * @example
 * ```ts
 * escapeICalText('Meeting at 5pm; bring notes, laptop')
 * // Returns: 'Meeting at 5pm\\; bring notes\\, laptop'
 * ```
 */
export function escapeICalText(text: string | null | undefined): string {
  if (text == null) return "";
  let result = String(text);
  for (const [pattern, replacement] of ICAL_ESCAPE_CHARS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Dangerous filename characters
 */
const FILENAME_UNSAFE_REGEX = /[<>:"/\\|?*\x00-\x1f]/g;
const PATH_TRAVERSAL_REGEX = /\.{2,}[/\\]/g;

/**
 * Sanitize a filename for safe file system use
 *
 * Removes:
 * - Path traversal attempts (../)
 * - Invalid filesystem characters
 * - Leading/trailing dots and spaces
 *
 * @example
 * ```ts
 * sanitizeFilename('../../../etc/passwd')
 * // Returns: 'etc-passwd'
 *
 * sanitizeFilename('voyage à Paris.pdf')
 * // Returns: 'voyage-a-paris.pdf'
 * ```
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (filename == null) return "file";

  let result = String(filename)
    // Remove path traversal attempts
    .replace(PATH_TRAVERSAL_REGEX, "")
    // Remove directory separators
    .replace(/[/\\]/g, "-")
    // Remove invalid characters
    .replace(FILENAME_UNSAFE_REGEX, "")
    // Replace spaces and accented characters
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    // Remove leading/trailing dots and dashes
    .replace(/^[-_.]+|[-_.]+$/g, "")
    // Lowercase for consistency
    .toLowerCase()
    // Limit length
    .slice(0, 200);

  return result || "file";
}

/**
 * URL-safe encoding for query parameters
 */
export function encodeURIComponentSafe(text: string | null | undefined): string {
  if (text == null) return "";
  try {
    return encodeURIComponent(String(text));
  } catch {
    // Handle malformed strings
    return "";
  }
}

/**
 * Safe Base64 encoding for URLs
 */
export function base64UrlEncode(text: string): string {
  try {
    return btoa(text)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

/**
 * Safe Base64 decoding from URLs
 */
export function base64UrlDecode(encoded: string): string | null {
  try {
    const padded = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), "=");
    return atob(padded);
  } catch {
    return null;
  }
}

/**
 * Strip HTML tags from text (for plain text extraction)
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (html == null) return "";
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Validate and sanitize JSON data to prevent prototype pollution
 */
export function safeJsonParse<T = unknown>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);
    // Remove __proto__ and constructor to prevent prototype pollution
    if (typeof parsed === "object" && parsed !== null) {
      delete (parsed as Record<string, unknown>).__proto__;
      delete (parsed as Record<string, unknown>).constructor;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Truncate text safely (without breaking HTML entities)
 */
export function truncateSafe(
  text: string | null | undefined,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text == null) return "";
  const str = String(text);
  if (str.length <= maxLength) return str;

  // Find a safe break point (not in middle of HTML entity)
  let breakPoint = maxLength - suffix.length;
  const lastAmpersand = str.lastIndexOf("&", breakPoint);
  const lastSemicolon = str.indexOf(";", lastAmpersand);

  // If we're in the middle of an entity, break before it
  if (lastAmpersand > breakPoint - 10 && lastSemicolon > breakPoint) {
    breakPoint = lastAmpersand;
  }

  return str.slice(0, breakPoint) + suffix;
}

/**
 * Content Security Policy nonce generator
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default {
  escapeHtml,
  escapeHtmlAttribute,
  escapeICalText,
  sanitizeFilename,
  encodeURIComponentSafe,
  base64UrlEncode,
  base64UrlDecode,
  stripHtmlTags,
  safeJsonParse,
  truncateSafe,
  generateNonce,
};
