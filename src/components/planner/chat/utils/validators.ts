/**
 * Validators - Input validation and type guards
 *
 * Provides runtime validation for dates, numbers, strings,
 * and complex objects to prevent runtime errors.
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate and parse a date from various inputs
 *
 * @example
 * ```ts
 * validateDate('2024-07-15') // { success: true, data: Date }
 * validateDate('invalid')    // { success: false, error: 'Invalid date' }
 * validateDate(null)         // { success: false, error: 'Date is required' }
 * ```
 */
export function validateDate(
  input: unknown,
  options: { required?: boolean; minDate?: Date; maxDate?: Date } = {}
): ValidationResult<Date> {
  const { required = true, minDate, maxDate } = options;

  // Handle null/undefined
  if (input == null || input === "") {
    if (required) {
      return { success: false, error: "Date is required" };
    }
    return { success: true, data: undefined };
  }

  // Parse the date
  let date: Date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "string" || typeof input === "number") {
    date = new Date(input);
  } else {
    return { success: false, error: "Invalid date format" };
  }

  // Check if valid
  if (isNaN(date.getTime())) {
    return { success: false, error: "Invalid date" };
  }

  // Check bounds
  if (minDate && date < minDate) {
    return { success: false, error: `Date must be after ${minDate.toISOString()}` };
  }
  if (maxDate && date > maxDate) {
    return { success: false, error: `Date must be before ${maxDate.toISOString()}` };
  }

  return { success: true, data: date };
}

/**
 * Safe date parsing that returns null instead of throwing
 */
export function safeParseDate(input: unknown): Date | null {
  const result = validateDate(input, { required: false });
  return result.success ? result.data ?? null : null;
}

/**
 * Check if a value is a valid Date
 */
export function isValidDate(input: unknown): input is Date {
  return input instanceof Date && !isNaN(input.getTime());
}

/**
 * Validate a number within bounds
 */
export function validateNumber(
  input: unknown,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidationResult<number> {
  const { required = true, min, max, integer = false } = options;

  // Handle null/undefined
  if (input == null || input === "") {
    if (required) {
      return { success: false, error: "Number is required" };
    }
    return { success: true, data: undefined };
  }

  // Parse the number
  const num = typeof input === "number" ? input : Number(input);

  // Check if valid
  if (isNaN(num)) {
    return { success: false, error: "Invalid number" };
  }

  // Check integer
  if (integer && !Number.isInteger(num)) {
    return { success: false, error: "Must be an integer" };
  }

  // Check bounds
  if (min !== undefined && num < min) {
    return { success: false, error: `Must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { success: false, error: `Must be at most ${max}` };
  }

  return { success: true, data: num };
}

/**
 * Safe number parsing
 */
export function safeParseNumber(input: unknown, fallback: number = 0): number {
  const result = validateNumber(input, { required: false });
  return result.success && result.data !== undefined ? result.data : fallback;
}

/**
 * Validate a positive integer (for counts, quantities)
 */
export function validatePositiveInt(
  input: unknown,
  options: { required?: boolean; max?: number } = {}
): ValidationResult<number> {
  return validateNumber(input, {
    ...options,
    min: 0,
    integer: true,
  });
}

/**
 * Validate a price (positive number with 2 decimal places)
 */
export function validatePrice(
  input: unknown,
  options: { required?: boolean; max?: number } = {}
): ValidationResult<number> {
  const result = validateNumber(input, {
    ...options,
    min: 0,
  });

  if (result.success && result.data !== undefined) {
    // Round to 2 decimal places
    result.data = Math.round(result.data * 100) / 100;
  }

  return result;
}

/**
 * Validate a string with length constraints
 */
export function validateString(
  input: unknown,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    trim?: boolean;
  } = {}
): ValidationResult<string> {
  const { required = true, minLength, maxLength, pattern, trim = true } = options;

  // Handle null/undefined
  if (input == null) {
    if (required) {
      return { success: false, error: "String is required" };
    }
    return { success: true, data: undefined };
  }

  // Convert to string
  let str = String(input);
  if (trim) {
    str = str.trim();
  }

  // Check if empty
  if (str === "") {
    if (required) {
      return { success: false, error: "String cannot be empty" };
    }
    return { success: true, data: undefined };
  }

  // Check length
  if (minLength !== undefined && str.length < minLength) {
    return { success: false, error: `Must be at least ${minLength} characters` };
  }
  if (maxLength !== undefined && str.length > maxLength) {
    return { success: false, error: `Must be at most ${maxLength} characters` };
  }

  // Check pattern
  if (pattern && !pattern.test(str)) {
    return { success: false, error: "Invalid format" };
  }

  return { success: true, data: str };
}

/**
 * Validate an email address
 */
export function validateEmail(
  input: unknown,
  options: { required?: boolean } = {}
): ValidationResult<string> {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(input, {
    ...options,
    pattern: emailPattern,
    maxLength: 254,
  });
}

/**
 * Validate array is not empty
 */
export function validateArray<T>(
  input: unknown,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  } = {}
): ValidationResult<T[]> {
  const { required = true, minLength = 0, maxLength } = options;

  // Handle null/undefined
  if (input == null) {
    if (required) {
      return { success: false, error: "Array is required" };
    }
    return { success: true, data: undefined };
  }

  // Check if array
  if (!Array.isArray(input)) {
    return { success: false, error: "Must be an array" };
  }

  // Check length
  if (input.length < minLength) {
    return { success: false, error: `Must have at least ${minLength} items` };
  }
  if (maxLength !== undefined && input.length > maxLength) {
    return { success: false, error: `Must have at most ${maxLength} items` };
  }

  return { success: true, data: input as T[] };
}

/**
 * Validate travelers object
 */
export interface TravelersInput {
  adults?: number;
  children?: number;
  infants?: number;
}

export function validateTravelers(
  input: unknown
): ValidationResult<Required<TravelersInput>> {
  if (input == null || typeof input !== "object") {
    return { success: false, error: "Travelers data is required" };
  }

  const data = input as TravelersInput;

  const adults = safeParseNumber(data.adults, 1);
  const children = safeParseNumber(data.children, 0);
  const infants = safeParseNumber(data.infants, 0);

  // Validate adults >= 1
  if (adults < 1) {
    return { success: false, error: "At least 1 adult is required" };
  }

  // Validate infants <= adults
  if (infants > adults) {
    return { success: false, error: "Cannot have more infants than adults" };
  }

  // Validate max travelers
  const total = adults + children + infants;
  if (total > 9) {
    return { success: false, error: "Maximum 9 travelers allowed" };
  }

  return {
    success: true,
    data: { adults, children, infants },
  };
}

/**
 * Validate date range
 */
export function validateDateRange(
  departure: unknown,
  returnDate: unknown,
  options: { maxNights?: number } = {}
): ValidationResult<{ departure: Date; return: Date; nights: number }> {
  const { maxNights = 365 } = options;

  const depResult = validateDate(departure);
  if (!depResult.success || !depResult.data) {
    return { success: false, error: `Departure: ${depResult.error}` };
  }

  const retResult = validateDate(returnDate);
  if (!retResult.success || !retResult.data) {
    return { success: false, error: `Return: ${retResult.error}` };
  }

  const dep = depResult.data;
  const ret = retResult.data;

  // Check order
  if (ret <= dep) {
    return { success: false, error: "Return date must be after departure" };
  }

  // Calculate nights
  const nights = Math.ceil((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24));

  if (nights > maxNights) {
    return { success: false, error: `Maximum ${maxNights} nights allowed` };
  }

  return {
    success: true,
    data: { departure: dep, return: ret, nights },
  };
}

/**
 * Type guard for non-null/undefined values
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard for positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && value > 0;
}

/**
 * Assert a condition and throw if false
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert a value is defined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  name: string
): asserts value is T {
  if (value == null) {
    throw new Error(`${name} is required but was ${value}`);
  }
}

export default {
  validateDate,
  safeParseDate,
  isValidDate,
  validateNumber,
  safeParseNumber,
  validatePositiveInt,
  validatePrice,
  validateString,
  validateEmail,
  validateArray,
  validateTravelers,
  validateDateRange,
  isDefined,
  isNonEmptyString,
  isPositiveNumber,
  assert,
  assertDefined,
};
