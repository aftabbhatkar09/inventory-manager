import { describe, it, expect } from "vitest";

import { parsePagination, assertMinLength, ValidationError } from "./validate.util.js";

describe("parsePagination", () => {
  it("defaults to page 1 and the given default limit", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10 });
  });

  it("clamps a limit above maxLimit down to maxLimit", () => {
    expect(parsePagination({ limit: "999999" })).toEqual({ page: 1, limit: 100 });
  });

  it("clamps a negative page or limit up to 1", () => {
    expect(parsePagination({ page: "-5", limit: "-3" })).toEqual({ page: 1, limit: 1 });
  });

  it("respects a custom maxLimit", () => {
    expect(parsePagination({ limit: "500" }, { maxLimit: 50 })).toEqual({
      page: 1,
      limit: 50,
    });
  });
});

describe("assertMinLength", () => {
  it("throws a ValidationError for a value shorter than the minimum", () => {
    expect(() => assertMinLength("short", 8, "Password")).toThrow(ValidationError);
  });

  it("returns the value when it meets the minimum", () => {
    expect(assertMinLength("longenough", 8, "Password")).toBe("longenough");
  });
});
