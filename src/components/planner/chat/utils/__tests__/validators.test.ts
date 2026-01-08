/**
 * Validators Tests
 *
 * Tests for input validation and type guard functions.
 *
 * @vitest-environment node
 */

import { describe, it, expect } from "vitest";
import {
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
} from "../validators";

describe("validateDate", () => {
  it("validates valid date string", () => {
    const result = validateDate("2024-07-15");
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Date);
  });

  it("validates Date object", () => {
    const date = new Date("2024-07-15");
    const result = validateDate(date);
    expect(result.success).toBe(true);
    expect(result.data).toBe(date);
  });

  it("validates timestamp number", () => {
    const timestamp = Date.now();
    const result = validateDate(timestamp);
    expect(result.success).toBe(true);
  });

  it("returns error for invalid date string", () => {
    const result = validateDate("invalid");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid date");
  });

  it("returns error for null when required", () => {
    const result = validateDate(null);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Date is required");
  });

  it("accepts null when not required", () => {
    const result = validateDate(null, { required: false });
    expect(result.success).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it("returns error for invalid format", () => {
    const result = validateDate({ invalid: true });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid date format");
  });

  it("validates minDate constraint", () => {
    const minDate = new Date("2024-01-01");
    const result = validateDate("2023-12-31", { minDate });
    expect(result.success).toBe(false);
    expect(result.error).toContain("must be after");
  });

  it("validates maxDate constraint", () => {
    const maxDate = new Date("2024-12-31");
    const result = validateDate("2025-01-01", { maxDate });
    expect(result.success).toBe(false);
    expect(result.error).toContain("must be before");
  });
});

describe("safeParseDate", () => {
  it("returns Date for valid input", () => {
    expect(safeParseDate("2024-07-15")).toBeInstanceOf(Date);
  });

  it("returns null for invalid input", () => {
    expect(safeParseDate("invalid")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(safeParseDate(null)).toBeNull();
  });
});

describe("isValidDate", () => {
  it("returns true for valid Date", () => {
    expect(isValidDate(new Date())).toBe(true);
  });

  it("returns false for Invalid Date", () => {
    expect(isValidDate(new Date("invalid"))).toBe(false);
  });

  it("returns false for non-Date", () => {
    expect(isValidDate("2024-01-01")).toBe(false);
    expect(isValidDate(123)).toBe(false);
  });
});

describe("validateNumber", () => {
  it("validates number", () => {
    const result = validateNumber(42);
    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  it("parses string number", () => {
    const result = validateNumber("42.5");
    expect(result.success).toBe(true);
    expect(result.data).toBe(42.5);
  });

  it("returns error for NaN", () => {
    const result = validateNumber("not a number");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid number");
  });

  it("returns error for null when required", () => {
    const result = validateNumber(null);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Number is required");
  });

  it("validates min constraint", () => {
    const result = validateNumber(5, { min: 10 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must be at least 10");
  });

  it("validates max constraint", () => {
    const result = validateNumber(15, { max: 10 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must be at most 10");
  });

  it("validates integer constraint", () => {
    const result = validateNumber(5.5, { integer: true });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must be an integer");
  });

  it("accepts integer when required", () => {
    const result = validateNumber(5, { integer: true });
    expect(result.success).toBe(true);
  });
});

describe("safeParseNumber", () => {
  it("returns number for valid input", () => {
    expect(safeParseNumber("42")).toBe(42);
  });

  it("returns fallback for invalid input", () => {
    expect(safeParseNumber("invalid", 10)).toBe(10);
  });

  it("returns default fallback of 0", () => {
    expect(safeParseNumber(null)).toBe(0);
  });
});

describe("validatePositiveInt", () => {
  it("validates positive integer", () => {
    const result = validatePositiveInt(5);
    expect(result.success).toBe(true);
  });

  it("accepts zero", () => {
    const result = validatePositiveInt(0);
    expect(result.success).toBe(true);
  });

  it("rejects negative number", () => {
    const result = validatePositiveInt(-1);
    expect(result.success).toBe(false);
  });

  it("rejects float", () => {
    const result = validatePositiveInt(5.5);
    expect(result.success).toBe(false);
  });
});

describe("validatePrice", () => {
  it("validates positive price", () => {
    const result = validatePrice(99.99);
    expect(result.success).toBe(true);
    expect(result.data).toBe(99.99);
  });

  it("rounds to 2 decimal places", () => {
    const result = validatePrice(99.999);
    expect(result.success).toBe(true);
    expect(result.data).toBe(100);
  });

  it("rejects negative price", () => {
    const result = validatePrice(-10);
    expect(result.success).toBe(false);
  });
});

describe("validateString", () => {
  it("validates string", () => {
    const result = validateString("hello");
    expect(result.success).toBe(true);
    expect(result.data).toBe("hello");
  });

  it("trims string by default", () => {
    const result = validateString("  hello  ");
    expect(result.data).toBe("hello");
  });

  it("does not trim when disabled", () => {
    const result = validateString("  hello  ", { trim: false });
    expect(result.data).toBe("  hello  ");
  });

  it("returns error for empty string when required", () => {
    const result = validateString("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("String cannot be empty");
  });

  it("validates minLength", () => {
    const result = validateString("ab", { minLength: 3 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must be at least 3 characters");
  });

  it("validates maxLength", () => {
    const result = validateString("hello", { maxLength: 3 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must be at most 3 characters");
  });

  it("validates pattern", () => {
    const result = validateString("abc123", { pattern: /^[a-z]+$/ });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid format");
  });

  it("passes pattern validation", () => {
    const result = validateString("abc", { pattern: /^[a-z]+$/ });
    expect(result.success).toBe(true);
  });
});

describe("validateEmail", () => {
  it("validates correct email", () => {
    const result = validateEmail("user@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = validateEmail("invalid-email");
    expect(result.success).toBe(false);
  });

  it("rejects email without domain", () => {
    const result = validateEmail("user@");
    expect(result.success).toBe(false);
  });

  it("rejects email without @", () => {
    const result = validateEmail("userexample.com");
    expect(result.success).toBe(false);
  });
});

describe("validateArray", () => {
  it("validates array", () => {
    const result = validateArray([1, 2, 3]);
    expect(result.success).toBe(true);
  });

  it("returns error for non-array", () => {
    const result = validateArray("not array");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must be an array");
  });

  it("validates minLength", () => {
    const result = validateArray([1], { minLength: 2 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must have at least 2 items");
  });

  it("validates maxLength", () => {
    const result = validateArray([1, 2, 3], { maxLength: 2 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Must have at most 2 items");
  });

  it("accepts empty array by default", () => {
    const result = validateArray([]);
    expect(result.success).toBe(true);
  });
});

describe("validateTravelers", () => {
  it("validates correct travelers", () => {
    const result = validateTravelers({ adults: 2, children: 1, infants: 0 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ adults: 2, children: 1, infants: 0 });
  });

  it("uses defaults for missing values", () => {
    const result = validateTravelers({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ adults: 1, children: 0, infants: 0 });
  });

  it("requires at least 1 adult", () => {
    const result = validateTravelers({ adults: 0 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("At least 1 adult is required");
  });

  it("rejects more infants than adults", () => {
    const result = validateTravelers({ adults: 1, infants: 2 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Cannot have more infants than adults");
  });

  it("rejects more than 9 travelers", () => {
    const result = validateTravelers({ adults: 5, children: 3, infants: 2 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Maximum 9 travelers allowed");
  });

  it("returns error for null input", () => {
    const result = validateTravelers(null);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Travelers data is required");
  });
});

describe("validateDateRange", () => {
  it("validates correct date range", () => {
    const result = validateDateRange("2024-07-15", "2024-07-20");
    expect(result.success).toBe(true);
    expect(result.data?.nights).toBe(5);
  });

  it("returns error for invalid departure", () => {
    const result = validateDateRange("invalid", "2024-07-20");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Departure");
  });

  it("returns error for invalid return", () => {
    const result = validateDateRange("2024-07-15", "invalid");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Return");
  });

  it("returns error when return is before departure", () => {
    const result = validateDateRange("2024-07-20", "2024-07-15");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Return date must be after departure");
  });

  it("returns error when same day", () => {
    const result = validateDateRange("2024-07-15", "2024-07-15");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Return date must be after departure");
  });

  it("validates maxNights constraint", () => {
    const result = validateDateRange("2024-01-01", "2025-01-02", { maxNights: 365 });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Maximum 365 nights allowed");
  });
});

describe("isDefined", () => {
  it("returns true for defined values", () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined("")).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined({})).toBe(true);
  });

  it("returns false for null and undefined", () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("returns true for non-empty string", () => {
    expect(isNonEmptyString("hello")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  it("returns false for whitespace only", () => {
    expect(isNonEmptyString("   ")).toBe(false);
  });

  it("returns false for non-string", () => {
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe("isPositiveNumber", () => {
  it("returns true for positive number", () => {
    expect(isPositiveNumber(42)).toBe(true);
    expect(isPositiveNumber(0.5)).toBe(true);
  });

  it("returns false for zero", () => {
    expect(isPositiveNumber(0)).toBe(false);
  });

  it("returns false for negative number", () => {
    expect(isPositiveNumber(-1)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isPositiveNumber(NaN)).toBe(false);
  });

  it("returns false for non-number", () => {
    expect(isPositiveNumber("42")).toBe(false);
  });
});

describe("assert", () => {
  it("does not throw for true condition", () => {
    expect(() => assert(true, "test")).not.toThrow();
  });

  it("throws for false condition", () => {
    expect(() => assert(false, "test message")).toThrow("Assertion failed: test message");
  });
});

describe("assertDefined", () => {
  it("does not throw for defined value", () => {
    expect(() => assertDefined("value", "name")).not.toThrow();
    expect(() => assertDefined(0, "name")).not.toThrow();
    expect(() => assertDefined(false, "name")).not.toThrow();
  });

  it("throws for null", () => {
    expect(() => assertDefined(null, "myVar")).toThrow("myVar is required but was null");
  });

  it("throws for undefined", () => {
    expect(() => assertDefined(undefined, "myVar")).toThrow("myVar is required but was undefined");
  });
});
