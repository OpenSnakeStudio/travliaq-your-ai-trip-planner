/**
 * TripExport Service - Export trip data to various formats
 *
 * Generates PDF summaries, email-ready content, and
 * shareable trip links.
 */

import type { WorkflowContext, StepSelections } from "../machines/workflowMachine";
import type { TimelineDay } from "../widgets/interactive/TimelineWidget";
import type { BookingSummary, TravelerInfo, ContactInfo } from "../widgets/booking/BookingFlowWidget";

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
 * Format date for export
 */
function formatDate(date: Date | string, language: string = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format short date
 */
function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Calculate nights between dates
 */
function calculateNights(departure: Date, returnDate: Date): number {
  const diff = returnDate.getTime() - departure.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
 */
export function generatePDFContent(
  trip: ExportedTrip,
  options: ExportOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const currency = trip.totalCost?.currency || opts.currency || "€";

  let html = `
<!DOCTYPE html>
<html lang="${opts.language}">
<head>
  <meta charset="UTF-8">
  <title>${trip.title}</title>
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
  <h1>${trip.title}</h1>
  <div class="meta">
    ${trip.dates.departure}${trip.dates.return ? ` → ${trip.dates.return}` : ""} •
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
      html += `
    <div class="card">
      <div class="card-title">Vol aller</div>
      <div class="card-detail">${trip.flights.outbound.departure}</div>
      ${trip.flights.outbound.price ? `<div class="price">${trip.flights.outbound.price}${currency}</div>` : ""}
    </div>
`;
    }
    if (trip.flights.return) {
      html += `
    <div class="card">
      <div class="card-title">Vol retour</div>
      <div class="card-detail">${trip.flights.return.departure}</div>
      ${trip.flights.return.price ? `<div class="price">${trip.flights.return.price}${currency}</div>` : ""}
    </div>
`;
    }
    html += `  </div>`;
  }

  // Hotel section
  if (trip.hotel) {
    html += `
  <h2>🏨 Hébergement</h2>
  <div class="section">
    <div class="card">
      <div class="card-title">${trip.hotel.name}</div>
      <div class="card-detail">
        Check-in: ${trip.hotel.checkIn}<br>
        Check-out: ${trip.hotel.checkOut}<br>
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
      html += `
    <div class="card">
      <div class="card-title">${activity.name}</div>
      ${activity.date ? `<div class="card-detail">${activity.date}</div>` : ""}
      ${activity.price ? `<div class="price">${activity.price}${currency}</div>` : ""}
    </div>
`;
    }
    html += `  </div>`;
  }

  // Total section
  if (trip.totalCost) {
    html += `
  <div class="total">
    <div>Total du voyage</div>
    <div class="total-amount">${trip.totalCost.amount}${trip.totalCost.currency}</div>
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
 */
export function generateICalContent(trip: ExportedTrip): string {
  const formatICalDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Travliaq//Trip Export//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  // Main trip event
  const startDate = new Date(trip.dates.departure);
  const endDate = trip.dates.return ? new Date(trip.dates.return) : startDate;

  ical += `BEGIN:VEVENT
UID:trip-${Date.now()}@travliaq.com
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${trip.title}
DESCRIPTION:Voyage à ${trip.destination}\\n${trip.travelers.total} voyageur(s)
LOCATION:${trip.destination}
END:VEVENT
`;

  // Add activities as separate events
  if (trip.activities) {
    for (const activity of trip.activities) {
      if (activity.date) {
        const activityDate = new Date(activity.date);
        ical += `BEGIN:VEVENT
UID:activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@travliaq.com
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(activityDate)}
DTEND:${formatICalDate(activityDate)}
SUMMARY:${activity.name}
DESCRIPTION:Activité à ${trip.destination}
LOCATION:${trip.destination}
END:VEVENT
`;
      }
    }
  }

  ical += `END:VCALENDAR`;

  return ical;
}

/**
 * Generate shareable link data
 */
export function generateShareableLink(trip: ExportedTrip): string {
  const data = {
    d: trip.destination,
    s: trip.dates.departure,
    e: trip.dates.return,
    t: trip.travelers.total,
    p: trip.totalCost?.amount,
  };

  const encoded = btoa(JSON.stringify(data));
  return `travliaq://trip/${encoded}`;
}

/**
 * Export trip to format
 */
export async function exportTrip(
  context: WorkflowContext,
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<{ data: string; filename: string; mimeType: string }> {
  const trip = exportContextToTrip(context, options);

  switch (format) {
    case "pdf": {
      const html = generatePDFContent(trip, options);
      return {
        data: html,
        filename: `voyage-${trip.destination.toLowerCase().replace(/\s+/g, "-")}.html`,
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
        filename: `voyage-${trip.destination.toLowerCase().replace(/\s+/g, "-")}.json`,
        mimeType: "application/json",
      };
    }

    case "ical": {
      const ical = generateICalContent(trip);
      return {
        data: ical,
        filename: `voyage-${trip.destination.toLowerCase().replace(/\s+/g, "-")}.ics`,
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
 */
export function downloadExport(
  data: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
