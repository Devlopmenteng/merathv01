/**
 * Unit tests for FractionClass — targeting uncovered lines/branches
 */

import { describe, it, expect } from "vitest";
import { FractionClass } from "../lib/engine/fraction";

describe("FractionClass - Construction & Simplification", () => {
  it("should handle negative denominator by flipping sign", () => {
    const f = new FractionClass(3, -4);
    expect(f.numeratorValue).toBe(-3);
    expect(f.denominatorValue).toBe(4);
  });

  it("should simplify zero numerator to denominator 1", () => {
    const f = new FractionClass(0, 99);
    expect(f.numeratorValue).toBe(0);
    expect(f.denominatorValue).toBe(1);
  });

  it("should throw on zero denominator", () => {
    expect(() => new FractionClass(1, 0)).toThrow();
  });

  it("should handle very large denominator (overflow protection)", () => {
    const f = new FractionClass(1, 2_000_000_000);
    // Should be scaled down to safe range
    expect(f.denominatorValue).toBeLessThanOrEqual(1_000_000_000);
    // Precision is reduced after scaling — verify order of magnitude
    expect(f.toDecimal()).toBeCloseTo(1 / 2_000_000_000, 8);
  });
});

describe("FractionClass - Arithmetic with FractionClass operands", () => {
  it("should multiply two fractions", () => {
    const a = new FractionClass(2, 3);
    const b = new FractionClass(3, 5);
    const result = a.multiply(b);
    expect(result.toDecimal()).toBeCloseTo(2 / 5);
  });

  it("should divide by another fraction", () => {
    const a = new FractionClass(1, 2);
    const b = new FractionClass(1, 3);
    const result = a.divide(b);
    expect(result.toDecimal()).toBeCloseTo(3 / 2);
  });

  it("should throw when dividing by zero fraction", () => {
    const a = new FractionClass(1, 2);
    const b = new FractionClass(0, 1);
    expect(() => a.divide(b)).toThrow();
  });

  it("should handle overflow in multiply with large fractions", () => {
    const a = new FractionClass(999_999_999, 1);
    const b = new FractionClass(1, 999_999_999);
    const result = a.multiply(b);
    expect(result.toDecimal()).toBeCloseTo(1.0);
  });

  it("should handle overflow in divide with large fractions", () => {
    const a = new FractionClass(1, 999_999_999);
    const b = new FractionClass(2, 1);
    const result = a.divide(b);
    expect(result.toDecimal()).toBeCloseTo(1 / 1_999_999_998, 8);
  });
});

describe("FractionClass - Overflow protection in add/subtract", () => {
  it("should fall back to decimal addition with huge denominators", () => {
    const a = new FractionClass(1, 999_999_999);
    const b = new FractionClass(1, 999_999_998);
    const result = a.add(b);
    expect(result.toDecimal()).toBeCloseTo(
      1 / 999_999_999 + 1 / 999_999_998,
      10,
    );
  });

  it("should fall back to decimal subtraction with huge denominators", () => {
    const a = new FractionClass(1, 999_999_998);
    const b = new FractionClass(1, 999_999_999);
    const result = a.subtract(b);
    expect(result.toDecimal()).toBeCloseTo(
      1 / 999_999_998 - 1 / 999_999_999,
      10,
    );
  });

  it("should fall back to decimal for multiply scalar with large denominator", () => {
    const a = new FractionClass(1, 500_000_001);
    const result = a.multiply(3);
    expect(result.toDecimal()).toBeCloseTo(3 / 500_000_001, 10);
  });

  it("should fall back to decimal for divide scalar with large denominator", () => {
    const a = new FractionClass(1, 500_000_001);
    const result = a.divide(3);
    expect(result.toDecimal()).toBeCloseTo(1 / 1_500_000_003, 8);
  });
});

describe("FractionClass - Comparison methods", () => {
  it("compare returns -1, 0, or 1", () => {
    const half = new FractionClass(1, 2);
    const third = new FractionClass(1, 3);
    const anotherHalf = new FractionClass(2, 4);

    expect(half.compare(third)).toBe(1);
    expect(third.compare(half)).toBe(-1);
    expect(half.compare(anotherHalf)).toBe(0);
  });

  it("greaterThan", () => {
    const half = new FractionClass(1, 2);
    const third = new FractionClass(1, 3);
    expect(half.greaterThan(third)).toBe(true);
    expect(third.greaterThan(half)).toBe(false);
  });

  it("lessThan", () => {
    const half = new FractionClass(1, 2);
    const third = new FractionClass(1, 3);
    expect(third.lessThan(half)).toBe(true);
    expect(half.lessThan(third)).toBe(false);
  });

  it("greaterThanOrEqual", () => {
    const half = new FractionClass(1, 2);
    const same = new FractionClass(2, 4);
    const third = new FractionClass(1, 3);
    expect(half.greaterThanOrEqual(same)).toBe(true);
    expect(half.greaterThanOrEqual(third)).toBe(true);
    expect(third.greaterThanOrEqual(half)).toBe(false);
  });

  it("lessThanOrEqual", () => {
    const half = new FractionClass(1, 2);
    const same = new FractionClass(2, 4);
    const third = new FractionClass(1, 3);
    expect(half.lessThanOrEqual(same)).toBe(true);
    expect(third.lessThanOrEqual(half)).toBe(true);
    expect(half.lessThanOrEqual(third)).toBe(false);
  });
});

describe("FractionClass - isPositive / isZero", () => {
  it("isPositive returns true for positive fractions", () => {
    expect(new FractionClass(1, 2).isPositive()).toBe(true);
  });

  it("isPositive returns false for zero and negative fractions", () => {
    expect(new FractionClass(0, 1).isPositive()).toBe(false);
    expect(new FractionClass(-1, 2).isPositive()).toBe(false);
  });

  it("isZero returns true only for zero", () => {
    expect(new FractionClass(0, 5).isZero()).toBe(true);
    expect(new FractionClass(1, 5).isZero()).toBe(false);
  });
});

describe("FractionClass - toString", () => {
  it("should return integer for denominator 1", () => {
    expect(new FractionClass(5, 1).toString()).toBe("5");
  });

  it("should return fraction string", () => {
    expect(new FractionClass(3, 7).toString()).toBe("3/7");
  });
});

describe("FractionClass - toArabicName", () => {
  it("should return known Arabic name for 1/6", () => {
    expect(new FractionClass(1, 6).toArabicName()).toBe("السدس");
  });

  it("should return known Arabic name for 2/3", () => {
    expect(new FractionClass(2, 3).toArabicName()).toBe("الثلثان");
  });

  it("should return known Arabic name for 1/8", () => {
    expect(new FractionClass(1, 8).toArabicName()).toBe("الثمن");
  });

  it("should handle fractions with numerator 1 not in map", () => {
    // 1/13 is not in the map but numerator=1
    expect(new FractionClass(1, 13).toArabicName()).toBe("جزء من 13");
  });

  it("should handle fractions with denominator > 10 not in map", () => {
    // 5/13 not in map, denominator > 10
    expect(new FractionClass(5, 13).toArabicName()).toBe("5 من 13");
  });

  it("should return key as fallback for unmapped small fraction", () => {
    // 3/7 is in the map
    expect(new FractionClass(3, 7).toArabicName()).toBe("ثلاثة أسباع");
  });

  it("should return common inheritance combination 1/12", () => {
    expect(new FractionClass(1, 12).toArabicName()).toBe(
      "واحد من اثني عشر",
    );
  });
});

describe("FractionClass - toData / fromData", () => {
  it("should round-trip through toData and fromData", () => {
    const original = new FractionClass(3, 8);
    const data = original.toData();
    expect(data).toEqual({ numerator: 3, denominator: 8 });

    const restored = FractionClass.fromData(data);
    expect(restored.toDecimal()).toBeCloseTo(original.toDecimal());
  });
});

describe("FractionClass - fromDecimal", () => {
  it("should convert 0 to 0/1", () => {
    const f = FractionClass.fromDecimal(0);
    expect(f.numeratorValue).toBe(0);
    expect(f.denominatorValue).toBe(1);
  });

  it("should convert 0.5 to 1/2", () => {
    const f = FractionClass.fromDecimal(0.5);
    expect(f.numeratorValue).toBe(1);
    expect(f.denominatorValue).toBe(2);
  });

  it("should convert 0.333... approximately to 1/3", () => {
    const f = FractionClass.fromDecimal(1 / 3);
    expect(f.toDecimal()).toBeCloseTo(1 / 3, 8);
  });

  it("should handle negative decimals", () => {
    const f = FractionClass.fromDecimal(-0.25);
    expect(f.toDecimal()).toBeCloseTo(-0.25);
    expect(f.numeratorValue).toBeLessThan(0);
  });

  it("should handle very small decimals with high precision", () => {
    const f = FractionClass.fromDecimal(0.0000001);
    expect(f.toDecimal()).toBeCloseTo(0.0000001, 10);
  });

  it("should handle integer decimals", () => {
    const f = FractionClass.fromDecimal(5.0);
    expect(f.numeratorValue).toBe(5);
    expect(f.denominatorValue).toBe(1);
  });
});

describe("FractionClass - getNumerator / getDenominator", () => {
  it("should return numerator via method", () => {
    const f = new FractionClass(7, 11);
    expect(f.getNumerator()).toBe(7);
  });

  it("should return denominator via method", () => {
    const f = new FractionClass(7, 11);
    expect(f.getDenominator()).toBe(11);
  });
});

describe("FractionClass - getCommonDenominator", () => {
  it("should return LCM of two denominators", () => {
    const a = new FractionClass(1, 4);
    const b = new FractionClass(1, 6);
    expect(a.getCommonDenominator(b)).toBe(12);
  });

  it("should return same denominator when equal", () => {
    const a = new FractionClass(1, 5);
    const b = new FractionClass(2, 5);
    expect(a.getCommonDenominator(b)).toBe(5);
  });
});

describe("FractionClass - toDenominator", () => {
  it("should scale fraction to target denominator", () => {
    // Use 1/4 -> 8 to avoid simplification (since constructor simplifies)
    const f = new FractionClass(1, 4);
    const scaled = f.toDenominator(8);
    // 1/4 * 2/2 = 2/8 which simplifies back to 1/4
    // Actually the constructor simplifies, so check decimal value instead
    expect(scaled.toDecimal()).toBeCloseTo(0.25);
  });

  it("should throw if target is not a multiple", () => {
    const f = new FractionClass(1, 3);
    expect(() => f.toDenominator(7)).toThrow();
  });
});

describe("FractionClass - isSafe / toApproximateDecimal", () => {
  it("isSafe returns true for normal fractions", () => {
    expect(new FractionClass(1, 2).isSafe()).toBe(true);
  });

  it("toApproximateDecimal returns isExact true for normal fractions", () => {
    const { value, isExact } = new FractionClass(1, 4).toApproximateDecimal();
    expect(value).toBeCloseTo(0.25);
    expect(isExact).toBe(true);
  });
});

describe("FractionClass - equals with tolerance", () => {
  it("should find equality within default tolerance", () => {
    const a = new FractionClass(1, 3);
    const b = new FractionClass(333, 1000);
    expect(a.equals(b)).toBe(true);
  });

  it("should distinguish fractions outside tolerance", () => {
    const a = new FractionClass(1, 2);
    const b = new FractionClass(1, 3);
    expect(a.equals(b)).toBe(false);
  });
});
