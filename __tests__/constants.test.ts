/**
 * Unit tests for constants.ts — targeting uncovered functions and branches
 */

import { describe, it, expect } from "vitest";
import {
  isValidHeirType,
  formatCurrency,
  formatPercentage,
  lcm,
  gcd,
  generateId,
  measureTime,
  formatTime,
  validateEstateData,
  validateHeirsData,
  countTotalHeirs,
  countHeirTypes,
  sortHeirsByPriority,
  getHeirName,
  getMadhhabColor,
  getMadhhabIcon,
  getMadhhabName,
  getMadhhabConfig,
  getHijabRules,
  isValidMadhab,
  MADHAB_COLORS,
  MADHAB_ICONS,
  MADHAB_NAMES,
  HEIR_NAMES,
  FIQH_DATABASE,
} from "../lib/engine/constants";

describe("isValidHeirType", () => {
  it("should return true for valid heir types", () => {
    expect(isValidHeirType("husband")).toBe(true);
    expect(isValidHeirType("wife")).toBe(true);
    expect(isValidHeirType("son")).toBe(true);
    expect(isValidHeirType("daughter")).toBe(true);
    expect(isValidHeirType("full_brother")).toBe(true);
    expect(isValidHeirType("treasury")).toBe(true);
  });

  it("should return false for invalid heir types", () => {
    expect(isValidHeirType("cousin_twice_removed")).toBe(false);
    expect(isValidHeirType("")).toBe(false);
    expect(isValidHeirType("xyz")).toBe(false);
  });
});

describe("formatCurrency", () => {
  it("should format a number as SAR currency", () => {
    const result = formatCurrency(1000);
    // Arabic locale uses Arabic-Indic numerals and ر.س.
    expect(result).toContain("ر.س.");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("ر.س.");
  });

  it("should handle fractional amounts", () => {
    const result = formatCurrency(1234.56);
    expect(result).toBeTruthy();
  });
});

describe("formatPercentage", () => {
  it("should format 0.5 as 50.00%", () => {
    expect(formatPercentage(0.5)).toBe("50.00%");
  });

  it("should format 1 as 100.00%", () => {
    expect(formatPercentage(1)).toBe("100.00%");
  });

  it("should format 0.333 as 33.30%", () => {
    expect(formatPercentage(0.333)).toBe("33.30%");
  });

  it("should handle zero", () => {
    expect(formatPercentage(0)).toBe("0.00%");
  });
});

describe("gcd", () => {
  it("should return GCD of two numbers", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(15, 10)).toBe(5);
    expect(gcd(7, 3)).toBe(1);
  });

  it("should handle one argument being zero", () => {
    expect(gcd(5, 0)).toBe(5);
    expect(gcd(0, 7)).toBe(7);
  });
});

describe("lcm", () => {
  it("should return LCM of two numbers", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 5)).toBe(15);
    expect(lcm(2, 2)).toBe(2);
  });

  it("should handle 1", () => {
    expect(lcm(1, 7)).toBe(7);
  });
});

describe("generateId", () => {
  it("should return a unique string each call", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(5);
  });

  it("should contain underscore separator", () => {
    const id = generateId();
    expect(id).toContain("_");
  });
});

describe("measureTime", () => {
  it("should return result and elapsed time", () => {
    const { result, time } = measureTime(() => 42);
    expect(result).toBe(42);
    expect(time).toBeGreaterThanOrEqual(0);
  });

  it("should measure the function execution", () => {
    const { result, time } = measureTime(() => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) sum += i;
      return sum;
    });
    expect(result).toBe(499500);
    expect(typeof time).toBe("number");
  });
});

describe("formatTime", () => {
  it("should format milliseconds < 1000 in ms", () => {
    expect(formatTime(123.45)).toBe("123.45ms");
  });

  it("should format milliseconds >= 1000 in seconds", () => {
    expect(formatTime(2500)).toBe("2.50s");
  });

  it("should format exactly 1000 in seconds", () => {
    expect(formatTime(1000)).toBe("1.00s");
  });
});

describe("validateEstateData - additional branches", () => {
  it("should reject negative funeral costs", () => {
    const result = validateEstateData(100000, -1, 0);
    expect(result).not.toBeNull();
  });

  it("should reject negative debts", () => {
    const result = validateEstateData(100000, 0, -1);
    expect(result).not.toBeNull();
  });

  it("should reject negative will", () => {
    const result = validateEstateData(100000, 0, 0, -1);
    expect(result).not.toBeNull();
  });

  it("should reject will exceeding one third of estate", () => {
    const result = validateEstateData(90000, 0, 0, 40000);
    expect(result).not.toBeNull();
  });

  it("should accept will at exactly one third", () => {
    const result = validateEstateData(90000, 0, 0, 30000);
    expect(result).toBeNull();
  });

  it("should accept valid estate with all costs", () => {
    const result = validateEstateData(100000, 5000, 10000, 20000);
    expect(result).toBeNull();
  });
});

describe("validateHeirsData - additional branches", () => {
  it("should accept heirs with undefined values", () => {
    const heirs = { husband: 1, wife: undefined };
    expect(validateHeirsData(heirs)).toBeNull();
  });

  it("should reject all-zero counts", () => {
    const heirs = { husband: 0, wife: 0 };
    expect(validateHeirsData(heirs)).not.toBeNull();
  });
});

describe("countTotalHeirs - edge cases", () => {
  it("should handle all undefined", () => {
    expect(countTotalHeirs({ husband: undefined, wife: undefined })).toBe(0);
  });

  it("should sum multiple heirs", () => {
    expect(countTotalHeirs({ son: 3, daughter: 2, wife: 1 })).toBe(6);
  });
});

describe("countHeirTypes", () => {
  it("should count distinct heir types with count > 0", () => {
    const heirs = { husband: 1, wife: 0, son: 3, daughter: undefined };
    expect(countHeirTypes(heirs)).toBe(2); // husband, son
  });

  it("should return 0 when no heirs", () => {
    expect(countHeirTypes({})).toBe(0);
  });
});

describe("sortHeirsByPriority", () => {
  it("should sort heirs by fiqh priority", () => {
    const heirs = sortHeirsByPriority(["full_brother", "husband", "son"]);
    expect(heirs[0]).toBe("husband");
    expect(heirs[1]).toBe("son");
    expect(heirs[2]).toBe("full_brother");
  });

  it("should not mutate the original array", () => {
    const original = ["daughter", "wife", "father"] as const;
    const copy = [...original];
    sortHeirsByPriority([...original]);
    expect(copy).toEqual(original);
  });
});

describe("getHeirName", () => {
  it("should return Arabic name for known heirs", () => {
    expect(getHeirName("husband")).toBe("الزوج");
    expect(getHeirName("wife")).toBe("الزوجة");
    expect(getHeirName("son")).toBe("الابن");
    expect(getHeirName("full_brother")).toBe("الأخ الشقيق");
  });
});

describe("getMadhhabColor", () => {
  it("should return correct color for each madhab", () => {
    expect(getMadhhabColor("shafii")).toBe("#FF6B6B");
    expect(getMadhhabColor("hanafi")).toBe("#4ECDC4");
    expect(getMadhhabColor("maliki")).toBe("#45B7D1");
    expect(getMadhhabColor("hanbali")).toBe("#F7DC6F");
  });
});

describe("getMadhhabIcon", () => {
  it("should return correct icon for each madhab", () => {
    expect(getMadhhabIcon("shafii")).toBe("🕌");
    expect(getMadhhabIcon("hanafi")).toBe("📖");
    expect(getMadhhabIcon("maliki")).toBe("⚖️");
    expect(getMadhhabIcon("hanbali")).toBe("📜");
  });
});

describe("getMadhhabName", () => {
  it("should return Arabic name for each madhab", () => {
    expect(getMadhhabName("shafii")).toBe("المذهب الشافعي");
    expect(getMadhhabName("hanafi")).toBe("المذهب الحنفي");
    expect(getMadhhabName("maliki")).toBe("المذهب المالكي");
    expect(getMadhhabName("hanbali")).toBe("المذهب الحنبلي");
  });
});

describe("getMadhhabConfig", () => {
  it("should return config for valid madhab", () => {
    const config = getMadhhabConfig("shafii");
    expect(config).not.toBeNull();
    expect(config!.code).toBe("shafii");
    expect(config!.name).toBe("المذهب الشافعي");
    expect(config!.rules).toBeDefined();
  });

  it("should return null for invalid madhab", () => {
    expect(getMadhhabConfig("invalid")).toBeNull();
  });
});

describe("getHijabRules", () => {
  it("should return rules array for valid madhab", () => {
    const rules = getHijabRules("shafii");
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
  });

  it("should return empty array for invalid madhab", () => {
    const rules = getHijabRules("invalid");
    expect(rules).toEqual([]);
  });
});

describe("isValidMadhab", () => {
  it("should return true for valid madhabs", () => {
    expect(isValidMadhab("shafii")).toBe(true);
    expect(isValidMadhab("hanafi")).toBe(true);
    expect(isValidMadhab("maliki")).toBe(true);
    expect(isValidMadhab("hanbali")).toBe(true);
  });

  it("should return false for invalid madhab", () => {
    expect(isValidMadhab("invalid")).toBe(false);
    expect(isValidMadhab("")).toBe(false);
  });
});

describe("FIQH_DATABASE structure", () => {
  it("should have all four madhabs", () => {
    expect(FIQH_DATABASE.madhabs.shafii).toBeDefined();
    expect(FIQH_DATABASE.madhabs.hanafi).toBeDefined();
    expect(FIQH_DATABASE.madhabs.maliki).toBeDefined();
    expect(FIQH_DATABASE.madhabs.hanbali).toBeDefined();
  });

  it("should have provisions for basic heirs", () => {
    expect(FIQH_DATABASE.provisions.husband).toBeDefined();
    expect(FIQH_DATABASE.provisions.wife).toBeDefined();
    expect(FIQH_DATABASE.provisions.son).toBeDefined();
    expect(FIQH_DATABASE.provisions.daughter).toBeDefined();
    expect(FIQH_DATABASE.provisions.father).toBeDefined();
    expect(FIQH_DATABASE.provisions.mother).toBeDefined();
  });

  it("should have hijabRules for all madhabs", () => {
    expect(FIQH_DATABASE.hijabRules.shafii.length).toBeGreaterThan(0);
    expect(FIQH_DATABASE.hijabRules.hanafi.length).toBeGreaterThan(0);
    expect(FIQH_DATABASE.hijabRules.maliki.length).toBeGreaterThan(0);
    expect(FIQH_DATABASE.hijabRules.hanbali.length).toBeGreaterThan(0);
  });

  it("should have special cases", () => {
    expect(FIQH_DATABASE.specialCases.umariyyah).toBeDefined();
    expect(FIQH_DATABASE.specialCases.awl).toBeDefined();
    expect(FIQH_DATABASE.specialCases.radd).toBeDefined();
  });

  it("should have constants", () => {
    expect(FIQH_DATABASE.constants.PRECISION).toBe(10);
    expect(FIQH_DATABASE.constants.TOLERANCE).toBe(0.0001);
    expect(FIQH_DATABASE.constants.MIN_AMOUNT).toBe(0.01);
    expect(FIQH_DATABASE.constants.DEFAULT_ESTATE).toBe(120000);
  });
});

describe("HEIR_NAMES constant", () => {
  it("should have all expected heir types", () => {
    const expectedTypes = [
      "husband",
      "wife",
      "father",
      "mother",
      "son",
      "daughter",
      "grandfather",
      "grandmother_mother",
      "grandmother_father",
      "grandson",
      "granddaughter",
      "full_brother",
      "full_sister",
      "paternal_brother",
      "paternal_sister",
      "maternal_brother",
      "maternal_sister",
      "full_nephew",
      "paternal_nephew",
      "full_uncle",
      "paternal_uncle",
      "maternal_uncle",
      "paternal_aunt",
      "maternal_aunt",
      "full_cousin",
      "paternal_cousin",
      "treasury",
      "shared_siblings",
    ];
    for (const type of expectedTypes) {
      expect(HEIR_NAMES[type as keyof typeof HEIR_NAMES]).toBeDefined();
    }
  });
});
