import { supabase } from "@/integrations/supabase/client";

export interface Airport {
  iata: string;
  name: string;
  city_name: string;
  country_code: string;
  lat: number;
  lon: number;
  distance_km: number;
}

export interface NearestAirportsResponse {
  city_query: string;
  matched_city: string;
  matched_city_id: string;
  match_score: number;
  city_location: {
    lat: number;
    lon: number;
  };
  airports: Airport[];
}

// Major commercial airports - known IATA codes for passenger flights
// This list includes the main international and regional airports
const MAJOR_AIRPORTS = new Set([
  // France
  "CDG", "ORY", "NCE", "LYS", "MRS", "TLS", "BOD", "NTE", "SXB", "BIQ", "LIL", "MPL", "RNS", "BVA",
  // Belgium
  "BRU", "CRL", "LGG", "OST",
  // UK
  "LHR", "LGW", "STN", "LTN", "MAN", "BHX", "EDI", "GLA", "BRS", "NCL", "LBA", "EMA", "LPL", "SEN", "LCY", "ABZ", "BFS", "BHD", "CWL", "EXT", "SOU",
  // Germany
  "FRA", "MUC", "BER", "DUS", "HAM", "STR", "CGN", "HAJ", "NUE", "LEJ", "DTM", "FMO", "HHN",
  // Netherlands
  "AMS", "EIN", "RTM", "MST",
  // Spain
  "MAD", "BCN", "AGP", "PMI", "ALC", "VLC", "SVQ", "BIO", "TFS", "LPA", "ACE", "FUE", "IBZ", "MAH", "SCQ", "GRX", "ZAZ",
  // Italy
  "FCO", "MXP", "LIN", "VCE", "BGY", "NAP", "BLQ", "PSA", "FLR", "TRN", "CTA", "PMO", "BRI", "CAG", "VRN", "TRS",
  // Portugal
  "LIS", "OPO", "FAO", "FNC", "PDL",
  // Switzerland
  "ZRH", "GVA", "BSL",
  // Austria
  "VIE", "SZG", "INN", "GRZ",
  // Greece
  "ATH", "SKG", "HER", "RHO", "CFU", "CHQ", "ZTH", "JTR", "JMK", "KGS",
  // Turkey
  "IST", "SAW", "ESB", "AYT", "ADB", "DLM", "BJV",
  // Scandinavia
  "CPH", "ARN", "GOT", "OSL", "BGO", "TRD", "HEL", "TMP", "OUL",
  // Eastern Europe
  "PRG", "VIE", "BUD", "WAW", "WMI", "KRK", "GDN", "OTP", "SOF", "BEG", "ZAG", "LJU",
  // Ireland
  "DUB", "SNN", "ORK",
  // Middle East
  "DXB", "AUH", "DOH", "RUH", "JED", "TLV", "AMM", "BEY", "KWI", "BAH", "MCT",
  // North Africa
  "CMN", "RAK", "AGA", "FEZ", "TNG", "ALG", "TUN", "CAI", "HRG", "SSH",
  // Sub-Saharan Africa
  "JNB", "CPT", "DUR", "NBO", "ADD", "LOS", "ACC", "ABJ", "DSS",
  // North America
  "JFK", "EWR", "LGA", "LAX", "ORD", "ATL", "DFW", "DEN", "SFO", "SEA", "MIA", "BOS", "PHX", "IAH", "LAS", "MCO", "CLT", "PHL", "MSP", "DTW", "BWI", "IAD", "DCA", "SAN", "TPA", "FLL", "PDX", "SLC", "HNL", "AUS", "SJC", "OAK", "SMF", "RDU", "BNA", "MCI", "IND", "CLE", "CMH", "STL", "MKE", "PIT", "CVG", "SAT", "SNA", "DAL", "HOU", "MDW", "BUR", "OGG",
  // Canada
  "YYZ", "YVR", "YUL", "YYC", "YOW", "YEG", "YWG", "YHZ", "YQB",
  // Mexico & Caribbean
  "MEX", "CUN", "GDL", "MTY", "SJD", "PVR", "TIJ", "SJU", "MBJ", "NAS", "PUJ", "SDQ", "HAV", "BGI", "AUA", "CUR", "SXM",
  // South America
  "GRU", "GIG", "BSB", "CGH", "SSA", "REC", "FOR", "POA", "CWB", "BEL", "VCP", "CNF", "BOG", "MDE", "CLO", "CTG", "LIM", "CUZ", "SCL", "EZE", "AEP", "COR", "MDZ", "GYE", "UIO", "CCS", "MVD", "ASU",
  // Asia Pacific
  "HKG", "SIN", "BKK", "DMK", "KUL", "CGK", "MNL", "ICN", "GMP", "NRT", "HND", "KIX", "CTS", "NGO", "FUK", "TPE", "PEK", "PVG", "CAN", "SZX", "CTU", "XIY", "HGH", "NKG", "WUH", "CSX", "TAO", "DLC", "SYX", "XMN", "HKT", "CNX", "USM", "KBV", "HAN", "SGN", "DAD", "REP", "PNH", "VTE", "RGN", "DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "COK", "GOI", "AMD", "JAI", "CMB", "MLE", "KTM", "ISB", "LHE", "KHI", "DPS", "SUB", "JOG",
  // Australia & New Zealand
  "SYD", "MEL", "BNE", "PER", "ADL", "OOL", "CNS", "CBR", "HBA", "AKL", "WLG", "CHC", "ZQN",
  // Pacific Islands
  "NAN", "PPT", "APW", "GUM", "HNL",
]);

// Filter to only major commercial airports
function filterMajorAirports(airports: Airport[]): Airport[] {
  const major = airports.filter(a => MAJOR_AIRPORTS.has(a.iata));
  
  // If we filtered out all airports, return the original list (fallback)
  if (major.length === 0 && airports.length > 0) {
    console.log("[useNearestAirports] No major airports found, returning original list");
    return airports;
  }
  
  return major;
}

export async function findNearestAirports(
  city: string,
  limit: number = 5, // Request more to have options after filtering
  countryCode?: string
): Promise<NearestAirportsResponse | null> {
  try {
    const body: { city: string; limit: number; country_code?: string } = { city, limit };
    
    if (countryCode) {
      body.country_code = countryCode;
    }

    const { data, error } = await supabase.functions.invoke("nearest-airports", {
      body,
    });

    if (error) {
      console.error("[useNearestAirports] Error:", error);
      return null;
    }

    // Log if fuzzy match was applied
    if (data?.match_score && data.match_score < 100) {
      console.log(`[useNearestAirports] City corrected: "${data.city_query}" → "${data.matched_city}" (score: ${data.match_score})`);
    }

    // Filter to only major commercial airports
    if (data?.airports) {
      const originalCount = data.airports.length;
      data.airports = filterMajorAirports(data.airports);
      console.log(`[useNearestAirports] Filtered ${originalCount} airports to ${data.airports.length} major airports`);
    }

    return data as NearestAirportsResponse;
  } catch (err) {
    console.error("[useNearestAirports] Exception:", err);
    return null;
  }
}
