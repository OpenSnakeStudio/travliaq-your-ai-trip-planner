/**
 * TripExport Service - Export trip data to various formats
 *
 * Generates PDF summaries, email-ready content, and
 * shareable trip links.
 *
 * SECURITY: All user-generated content is escaped before rendering
 * to prevent XSS attacks.
 */

import type { WorkflowContext, StepSelections } from "../machines/workflowMachine";
import type { TimelineDay } from "../widgets/interactive/TimelineWidget";
import type { BookingSummary, TravelerInfo, ContactInfo } from "../widgets/booking/BookingFlowWidget";
import { escapeHtml, escapeICalText, sanitizeFilename, base64UrlEncode } from "../utils/security";
import { safeParseDate, isValidDate } from "../utils/validators";

/**
 * Export format
 */
export type ExportFormat = "pdf" | "email" | "json" | "ical" | "link";

/**
 * Export options
 */
export interface ExportOptions {
  /** Include price details */
  includePrices?: boolean;
  /** Include traveler info */
  includeTravelers?: boolean;
  /** Include booking references */
  includeReferences?: boolean;
  /** Include timeline */
  includeTimeline?: boolean;
  /** Include weather */
  includeWeather?: boolean;
  /** Include map */
  includeMap?: boolean;
  /** Language */
  language?: "fr" | "en" | "es";
  /** Currency */
  currency?: string;
}

/**
 * Exported trip data
 */
export interface ExportedTrip {
  /** Trip title */
  title: string;
  /** Destination */
  destination: string;
  /** Dates */
  dates: {
    departure: string;
    return?: string;
    nights: number;
  };
  /** Travelers */
  travelers: {
    total: number;
    adults: number;
    children: number;
    infants: number;
    details?: TravelerInfo[];
  };
  /** Flights */
  flights?: {
    outbound?: {
      airline?: string;
      flightNumber?: string;
      departure: string;
      arrival: string;
      price?: number;
    };
    return?: {
      airline?: string;
      flightNumber?: string;
      departure: string;
      arrival: string;
      price?: number;
    };
  };
  /** Hotel */
  hotel?: {
    name: string;
    address?: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    price?: number;
  };
  /** Activities */
  activities?: Array<{
    name: string;
    date?: string;
    duration?: string;
    price?: number;
  }>;
  /** Total cost */
  totalCost?: {
    amount: number;
    currency: string;
    breakdown?: {
      flights?: number;
      hotel?: number;
      activities?: number;
      transfers?: number;
    };
  };
  /** Timeline */
  timeline?: TimelineDay[];
  /** Contact */
  contact?: ContactInfo;
  /** Booking references */
  references?: Array<{
    type: string;
    reference: string;
    provider?: string;
  }>;
  /** Generated at */
  generatedAt: string;
}

/**
 * Default export options
 */
const DEFAULT_OPTIONS: ExportOptions = {
  includePrices: true,
  includeTravelers: true,
  includeReferences: true,
  includeTimeline: false,
  includeWeather: false,
  includeMap: false,
  language: "fr",
  currency: "€",
};

/**
 * Format date for export (with validation)
 */
function formatDate(date: Date | string | null | undefined, language: string = "fr"): string {
  const parsed = safeParseDate(date);
  if (!parsed) return "Date non définie";

  try {
    return parsed.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Date invalide";
  }
}

/**
 * Format short date (with validation)
 */
function formatShortDate(date: Date | string | null | undefined): string {
  const parsed = safeParseDate(date);
  if (!parsed) return "";

  try {
    return parsed.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Calculate nights between dates (with validation)
 */
function calculateNights(departure: Date | null, returnDate: Date | null): number {
  if (!departure || !returnDate) return 0;
  if (!isValidDate(departure) || !isValidDate(returnDate)) return 0;

  const diff = returnDate.getTime() - departure.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Export context to trip data
 */
export function exportContextToTrip(
  context: WorkflowContext,
  options: ExportOptions = {}
): ExportedTrip {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { selections } = context;

  const departure = selections.dates?.departure
    ? new Date(selections.dates.departure)
    : new Date();
  const returnDate = selections.dates?.return
    ? new Date(selections.dates.return)
    : undefined;

  const nights = returnDate ? calculateNights(departure, returnDate) : 0;

  const trip: ExportedTrip = {
    title: `Voyage à ${selections.destination?.city || "Destination"}`,
    destination: selections.destination?.city || "Non définie",
    dates: {
      departure: formatDate(departure, opts.language),
      return: returnDate ? formatDate(returnDate, opts.language) : undefined,
      nights,
    },
    travelers: {
      total:
        (selections.travelers?.adults || 0) +
        (selections.travelers?.children || 0) +
        (selections.travelers?.infants || 0),
      adults: selections.travelers?.adults || 0,
      children: selections.travelers?.children || 0,
      infants: selections.travelers?.infants || 0,
    },
    generatedAt: new Date().toISOString(),
  };

  // Add flights
  if (selections.flights) {
    trip.flights = {};
    if (selections.flights.outbound) {
      trip.flights.outbound = {
        airline: selections.flights.outbound.airline,
        departure: formatDate(departure, opts.language),
        arrival: formatDate(departure, opts.language),
        price: opts.includePrices ? selections.flights.outbound.price : undefined,
      };
    }
    if (selections.flights.return) {
      trip.flights.return = {
        airline: selections.flights.return.airline,
        departure: returnDate ? formatDate(returnDate, opts.language) : "",
        arrival: returnDate ? formatDate(returnDate, opts.language) : "",
        price: opts.includePrices ? selections.flights.return.price : undefined,
      };
    }
  }

  // Add hotel
  if (selections.hotels) {
    trip.hotel = {
      name: selections.hotels.name || "Hôtel",
      checkIn: formatDate(departure, opts.language),
      checkOut: returnDate ? formatDate(returnDate, opts.language) : "",
      nights: selections.hotels.nights || nights,
      price: opts.includePrices ? selections.hotels.price : undefined,
    };
  }

  // Add activities
  if (selections.activities.length > 0) {
    trip.activities = selections.activities.map((a) => ({
      name: a.name,
      date: a.date ? formatDate(a.date, opts.language) : undefined,
      price: opts.includePrices ? a.price : undefined,
    }));
  }

  // Add total cost
  if (opts.includePrices) {
    const flightsCost =
      (selections.flights?.outbound?.price || 0) +
      (selections.flights?.return?.price || 0);
    const hotelCost = selections.hotels?.price || 0;
    const activitiesCost = selections.activities.reduce((s, a) => s + a.price, 0);
    const transfersCost = selections.transfers.reduce((s, t) => s + t.price, 0);

    trip.totalCost = {
      amount: flightsCost + hotelCost + activitiesCost + transfersCost,
      currency: opts.currency || "€",
      breakdown: {
        flights: flightsCost,
        hotel: hotelCost,
        activities: activitiesCost,
        transfers: transfersCost,
      },
    };
  }

  return trip;
}

/**
 * Generate PDF-ready HTML content
 *
 * SECURITY: All dynamic content is escaped to prevent XSS attacks.
 */
export function generatePDFContent(
  trip: ExportedTrip,
  options: ExportOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const currency = escapeHtml(trip.totalCost?.currency || opts.currency || "€");

  // Escape all user-generated content
  const title = escapeHtml(trip.title);
  const destination = escapeHtml(trip.destination);
  const departureDateStr = escapeHtml(trip.dates.departure);
  const returnDateStr = trip.dates.return ? escapeHtml(trip.dates.return) : "";

  let html = `
<!DOCTYPE html>
<html lang="${escapeHtml(opts.language || "fr")}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1a1a1a; }
    h1 { color: #2563eb; margin-bottom: 8px; }
    h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px; }
    .meta { color: #6b7280; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .card { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .card-title { font-weight: 600; margin-bottom: 8px; }
    .card-detail { color: #6b7280; font-size: 14px; }
    .price { color: #2563eb; font-weight: 600; }
    .total { background: #2563eb; color: white; border-radius: 8px; padding: 16px; text-align: center; }
    .total-amount { font-size: 32px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    ${departureDateStr}${returnDateStr ? ` → ${returnDateStr}` : ""} •
    ${trip.travelers.total} voyageur${trip.travelers.total > 1 ? "s" : ""}
  </div>
`;

  // Flights section
  if (trip.flights) {
    html += `
  <h2>✈️ Vols</h2>
  <div class="section">
`;
    if (trip.flights.outbound) {
      const outboundDeparture = escapeHtml(trip.flights.outbound.departure);
      const outboundAirline = escapeHtml(trip.flights.outbound.airline || "");
      html += `
    <div class="card">
      <div class="card-title">Vol aller${outboundAirline ? ` - ${outboundAirline}` : ""}</div>
      <div class="card-detail">${outboundDeparture}</div>
      ${trip.flights.outbound.price ? `<div class="price">${trip.flights.outbound.price}${currency}</div>` : ""}
    </div>
`;
    }
    if (trip.flights.return) {
      const returnDeparture = escapeHtml(trip.flights.return.departure);
      const returnAirline = escapeHtml(trip.flights.return.airline || "");
      html += `
    <div class="card">
      <div class="card-title">Vol retour${returnAirline ? ` - ${returnAirline}` : ""}</div>
      <div class="card-detail">${returnDeparture}</div>
      ${trip.flights.return.price ? `<div class="price">${trip.flights.return.price}${currency}</div>` : ""}
    </div>
`;
    }
    html += `  </div>`;
  }

  // Hotel section
  if (trip.hotel) {
    const hotelName = escapeHtml(trip.hotel.name);
    const hotelAddress = trip.hotel.address ? escapeHtml(trip.hotel.address) : "";
    const checkIn = escapeHtml(trip.hotel.checkIn);
    const checkOut = escapeHtml(trip.hotel.checkOut);

    html += `
  <h2>🏨 Hébergement</h2>
  <div class="section">
    <div class="card">
      <div class="card-title">${hotelName}</div>
      <div class="card-detail">
        ${hotelAddress ? `${hotelAddress}<br>` : ""}
        Check-in: ${checkIn}<br>
        Check-out: ${checkOut}<br>
        ${trip.hotel.nights} nuit${trip.hotel.nights > 1 ? "s" : ""}
      </div>
      ${trip.hotel.price ? `<div class="price">${trip.hotel.price}${currency}</div>` : ""}
    </div>
  </div>
`;
  }

  // Activities section
  if (trip.activities && trip.activities.length > 0) {
    html += `
  <h2>🎯 Activités</h2>
  <div class="section">
`;
    for (const activity of trip.activities) {
      const activityName = escapeHtml(activity.name);
      const activityDate = activity.date ? escapeHtml(activity.date) : "";
      const activityDuration = activity.duration ? escapeHtml(activity.duration) : "";

      html += `
    <div class="card">
      <div class="card-title">${activityName}</div>
      ${activityDate ? `<div class="card-detail">${activityDate}${activityDuration ? ` (${activityDuration})` : ""}</div>` : ""}
      ${activity.price ? `<div class="price">${activity.price}${currency}</div>` : ""}
    </div>
`;
    }
    html += `  </div>`;
  }

  // Total section
  if (trip.totalCost) {
    const totalCurrency = escapeHtml(trip.totalCost.currency);
    html += `
  <div class="total">
    <div>Total du voyage</div>
    <div class="total-amount">${trip.totalCost.amount}${totalCurrency}</div>
  </div>
`;
  }

  // Footer
  html += `
  <div class="footer">
    Généré par Travliaq le ${new Date().toLocaleDateString(opts.language === "fr" ? "fr-FR" : "en-US")}
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Generate email-ready text content
 */
export function generateEmailContent(
  trip: ExportedTrip,
  options: ExportOptions = {}
): { subject: string; body: string; html: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const currency = trip.totalCost?.currency || opts.currency || "€";

  const subject = `${trip.title} - ${trip.dates.departure}`;

  let body = `${trip.title}\n`;
  body += `${"=".repeat(trip.title.length)}\n\n`;
  body += `📍 Destination: ${trip.destination}\n`;
  body += `📅 Dates: ${trip.dates.departure}`;
  if (trip.dates.return) body += ` → ${trip.dates.return}`;
  body += `\n👥 Voyageurs: ${trip.travelers.total}\n\n`;

  if (trip.flights) {
    body += `✈️ VOLS\n`;
    body += `------\n`;
    if (trip.flights.outbound) {
      body += `Aller: ${trip.flights.outbound.departure}`;
      if (trip.flights.outbound.price) body += ` (${trip.flights.outbound.price}${currency})`;
      body += `\n`;
    }
    if (trip.flights.return) {
      body += `Retour: ${trip.flights.return.departure}`;
      if (trip.flights.return.price) body += ` (${trip.flights.return.price}${currency})`;
      body += `\n`;
    }
    body += `\n`;
  }

  if (trip.hotel) {
    body += `🏨 HÉBERGEMENT\n`;
    body += `--------------\n`;
    body += `${trip.hotel.name}\n`;
    body += `Check-in: ${trip.hotel.checkIn}\n`;
    body += `Check-out: ${trip.hotel.checkOut}\n`;
    if (trip.hotel.price) body += `Prix: ${trip.hotel.price}${currency}\n`;
    body += `\n`;
  }

  if (trip.activities && trip.activities.length > 0) {
    body += `🎯 ACTIVITÉS\n`;
    body += `------------\n`;
    for (const activity of trip.activities) {
      body += `• ${activity.name}`;
      if (activity.date) body += ` (${activity.date})`;
      if (activity.price) body += ` - ${activity.price}${currency}`;
      body += `\n`;
    }
    body += `\n`;
  }

  if (trip.totalCost) {
    body += `💰 TOTAL: ${trip.totalCost.amount}${trip.totalCost.currency}\n`;
  }

  body += `\n---\nGénéré par Travliaq`;

  // Generate HTML version
  const html = generatePDFContent(trip, opts);

  return { subject, body, html };
}

/**
 * Generate iCal content for calendar export
 *
 * SECURITY: All dynamic content is escaped for iCal format.
 */
export function generateICalContent(trip: ExportedTrip): string {
  const formatICalDate = (date: Date | string | null | undefined): string => {
    const parsed = safeParseDate(date);
    if (!parsed) return "";
    try {
      return parsed.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    } catch {
      return "";
    }
  };

  // Generate a unique ID using crypto if available
  const generateUID = (prefix: string): string => {
    const random = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    return `${prefix}-${random}@travliaq.com`;
  };

  // Escape all user content for iCal
  const title = escapeICalText(trip.title);
  const destination = escapeICalText(trip.destination);

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Travliaq//Trip Export//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  // Main trip event
  const startDate = safeParseDate(trip.dates.departure);
  const endDate = safeParseDate(trip.dates.return) || startDate;

  if (startDate) {
    ical += `BEGIN:VEVENT
UID:${generateUID("trip")}
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${title}
DESCRIPTION:Voyage à ${destination}\\n${trip.travelers.total} voyageur(s)
LOCATION:${destination}
END:VEVENT
`;
  }

  // Add activities as separate events
  if (trip.activities) {
    for (const activity of trip.activities) {
      if (activity.date) {
        const activityDate = safeParseDate(activity.date);
        if (activityDate) {
          const activityName = escapeICalText(activity.name);
          ical += `BEGIN:VEVENT
UID:${generateUID("activity")}
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(activityDate)}
DTEND:${formatICalDate(activityDate)}
SUMMARY:${activityName}
DESCRIPTION:Activité à ${destination}
LOCATION:${destination}
END:VEVENT
`;
        }
      }
    }
  }

  ical += `END:VCALENDAR`;

  return ical;
}

/**
 * Generate shareable link data
 *
 * Uses URL-safe base64 encoding for cross-platform compatibility.
 */
export function generateShareableLink(trip: ExportedTrip): string {
  const data = {
    d: trip.destination,
    s: trip.dates.departure,
    e: trip.dates.return,
    t: trip.travelers.total,
    p: trip.totalCost?.amount,
  };

  try {
    const encoded = base64UrlEncode(JSON.stringify(data));
    return `travliaq://trip/${encoded}`;
  } catch {
    // Fallback to basic encoding if base64 fails
    return `travliaq://trip/error`;
  }
}

/**
 * Export trip to format
 *
 * SECURITY: Filenames are sanitized to prevent path traversal attacks.
 */
export async function exportTrip(
  context: WorkflowContext,
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<{ data: string; filename: string; mimeType: string }> {
  const trip = exportContextToTrip(context, options);

  // Sanitize the destination for use in filenames
  const safeDestination = sanitizeFilename(trip.destination) || "voyage";

  switch (format) {
    case "pdf": {
      const html = generatePDFContent(trip, options);
      return {
        data: html,
        filename: `voyage-${safeDestination}.html`,
        mimeType: "text/html",
      };
    }

    case "email": {
      const { subject, body, html } = generateEmailContent(trip, options);
      return {
        data: JSON.stringify({ subject, body, html }),
        filename: "email-content.json",
        mimeType: "application/json",
      };
    }

    case "json": {
      return {
        data: JSON.stringify(trip, null, 2),
        filename: `voyage-${safeDestination}.json`,
        mimeType: "application/json",
      };
    }

    case "ical": {
      const ical = generateICalContent(trip);
      return {
        data: ical,
        filename: `voyage-${safeDestination}.ics`,
        mimeType: "text/calendar",
      };
    }

    case "link": {
      const link = generateShareableLink(trip);
      return {
        data: link,
        filename: "share-link.txt",
        mimeType: "text/plain",
      };
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Download exported file
 *
 * Note: This function requires a browser environment (document/DOM).
 * It will silently fail in SSR/Node.js environments.
 */
export function downloadExport(
  data: string,
  filename: string,
  mimeType: string
): void {
  // Guard against SSR/Node.js environment
  if (typeof document === "undefined" || typeof URL === "undefined") {
    console.warn("downloadExport: Cannot download in non-browser environment");
    return;
  }

  try {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizeFilename(filename) || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("downloadExport: Failed to download file", error);
  }
}
