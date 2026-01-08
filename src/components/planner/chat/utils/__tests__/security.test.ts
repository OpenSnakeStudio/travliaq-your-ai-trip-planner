/**
 * Security Utilities Tests
 *
 * Tests for XSS protection, sanitization, and safe encoding functions.
 *
 * @vitest-environment node
 */

import { describe, it, expect } from "vitest";
import {
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
} from "../security";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;"
    );
  });

  it("escapes ampersand", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes quotes and backticks", () => {
    expect(escapeHtml('test "value" and `code`')).toBe(
      "test &quot;value&quot; and &#x60;code&#x60;"
    );
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("escapes equals sign", () => {
    expect(escapeHtml("a=b")).toBe("a&#x3D;b");
  });

  it("returns empty string for null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("preserves normal text", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});

describe("escapeHtmlAttribute", () => {
  it("escapes HTML and control characters", () => {
    expect(escapeHtmlAttribute('<a onclick="bad">')).toBe(
      "&lt;a onclick&#x3D;&quot;bad&quot;&gt;"
    );
  });

  it("escapes newlines and tabs", () => {
    expect(escapeHtmlAttribute("line1\nline2\ttab")).toBe(
      "line1&#10;line2&#9;tab"
    );
  });

  it("escapes carriage return", () => {
    expect(escapeHtmlAttribute("text\rmore")).toBe("text&#13;more");
  });

  it("returns empty string for null", () => {
    expect(escapeHtmlAttribute(null)).toBe("");
  });
});

describe("escapeICalText", () => {
  it("escapes semicolons and commas", () => {
    expect(escapeICalText("Meeting at 5pm; bring notes, laptop")).toBe(
      "Meeting at 5pm\\; bring notes\\, laptop"
    );
  });

  it("escapes backslashes first", () => {
    expect(escapeICalText("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("escapes newlines", () => {
    expect(escapeICalText("line1\nline2")).toBe("line1\\nline2");
  });

  it("removes carriage returns", () => {
    expect(escapeICalText("text\r\nmore")).toBe("text\\nmore");
  });

  it("returns empty string for null", () => {
    expect(escapeICalText(null)).toBe("");
  });
});

describe("sanitizeFilename", () => {
  it("removes path traversal attempts", () => {
    expect(sanitizeFilename("../../../etc/passwd")).toBe("etc-passwd");
  });

  it("removes double dots with slashes", () => {
    expect(sanitizeFilename("..\\..\\secret")).toBe("secret");
  });

  it("removes invalid characters", () => {
    // Slashes are converted to dashes, other invalid chars removed
    expect(sanitizeFilename('file<>:"/\\|?*.txt')).toBe("file--.txt");
  });

  it("normalizes accented characters", () => {
    expect(sanitizeFilename("voyage à Paris.pdf")).toBe("voyage-a-paris.pdf");
  });

  it("replaces spaces with dashes", () => {
    expect(sanitizeFilename("my file name.pdf")).toBe("my-file-name.pdf");
  });

  it("removes leading and trailing dots", () => {
    expect(sanitizeFilename(".hidden.file.")).toBe("hidden.file");
  });

  it("converts to lowercase", () => {
    expect(sanitizeFilename("UPPERCASE.TXT")).toBe("uppercase.txt");
  });

  it("returns 'file' for null", () => {
    expect(sanitizeFilename(null)).toBe("file");
  });

  it("returns 'file' for empty result", () => {
    expect(sanitizeFilename("...")).toBe("file");
  });

  it("truncates long filenames", () => {
    const longName = "a".repeat(300) + ".txt";
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it("handles control characters", () => {
    expect(sanitizeFilename("file\x00\x1fname")).toBe("filename");
  });
});

describe("encodeURIComponentSafe", () => {
  it("encodes special characters", () => {
    expect(encodeURIComponentSafe("hello world")).toBe("hello%20world");
  });

  it("encodes unicode", () => {
    expect(encodeURIComponentSafe("café")).toBe("caf%C3%A9");
  });

  it("returns empty string for null", () => {
    expect(encodeURIComponentSafe(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(encodeURIComponentSafe(undefined)).toBe("");
  });
});

describe("base64UrlEncode", () => {
  it("encodes string to base64 URL-safe", () => {
    const encoded = base64UrlEncode("Hello World");
    expect(encoded).toBe("SGVsbG8gV29ybGQ");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("handles special characters", () => {
    const encoded = base64UrlEncode("test+/=");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
  });

  it("returns empty string on error", () => {
    // Create a string that will fail btoa (non-Latin1 characters)
    expect(base64UrlEncode("")).toBe("");
  });
});

describe("base64UrlDecode", () => {
  it("decodes base64 URL-safe string", () => {
    expect(base64UrlDecode("SGVsbG8gV29ybGQ")).toBe("Hello World");
  });

  it("handles strings with - and _", () => {
    const original = "test+/=";
    const encoded = base64UrlEncode(original);
    expect(base64UrlDecode(encoded)).toBe(original);
  });

  it("returns null on invalid input", () => {
    expect(base64UrlDecode("!!!invalid!!!")).toBeNull();
  });
});

describe("stripHtmlTags", () => {
  it("removes HTML tags", () => {
    expect(stripHtmlTags("<p>Hello</p>")).toBe("Hello");
  });

  it("handles nested tags", () => {
    expect(stripHtmlTags("<div><span>Text</span></div>")).toBe("Text");
  });

  it("decodes HTML entities", () => {
    expect(stripHtmlTags("Tom &amp; Jerry")).toBe("Tom & Jerry");
  });

  it("handles nbsp", () => {
    expect(stripHtmlTags("Hello&nbsp;World")).toBe("Hello World");
  });

  it("decodes all common entities", () => {
    expect(stripHtmlTags("&lt;tag&gt;")).toBe("<tag>");
    expect(stripHtmlTags("&quot;quoted&quot;")).toBe('"quoted"');
    expect(stripHtmlTags("it&#039;s")).toBe("it's");
  });

  it("returns empty string for null", () => {
    expect(stripHtmlTags(null)).toBe("");
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    expect(safeJsonParse('{"name": "test"}')).toEqual({ name: "test" });
  });

  it("parses arrays", () => {
    expect(safeJsonParse("[1, 2, 3]")).toEqual([1, 2, 3]);
  });

  it("parses primitives", () => {
    expect(safeJsonParse("123")).toBe(123);
    expect(safeJsonParse('"string"')).toBe("string");
    expect(safeJsonParse("true")).toBe(true);
    expect(safeJsonParse("null")).toBe(null);
  });

  it("returns null for invalid JSON", () => {
    expect(safeJsonParse("{invalid}")).toBeNull();
    expect(safeJsonParse("")).toBeNull();
  });

  it("removes __proto__ to prevent prototype pollution", () => {
    const result = safeJsonParse('{"__proto__": {"polluted": true}}');
    expect(result).not.toHaveProperty("__proto__");
  });

  it("removes constructor property", () => {
    const result = safeJsonParse('{"constructor": "bad"}');
    expect(result).not.toHaveProperty("constructor");
  });
});

describe("truncateSafe", () => {
  it("does not truncate short text", () => {
    expect(truncateSafe("Hello", 10)).toBe("Hello");
  });

  it("truncates long text with suffix", () => {
    expect(truncateSafe("Hello World", 8)).toBe("Hello...");
  });

  it("uses custom suffix", () => {
    expect(truncateSafe("Hello World", 7, "…")).toBe("Hello …");
  });

  it("returns empty string for null", () => {
    expect(truncateSafe(null, 10)).toBe("");
  });

  it("does not break HTML entities", () => {
    // If we truncate in middle of &amp;, it should break before the &
    const text = "Hello &amp; World";
    const result = truncateSafe(text, 10);
    expect(result).not.toContain("&am...");
  });

  it("handles text without entities", () => {
    expect(truncateSafe("1234567890", 5)).toBe("12...");
  });
});
