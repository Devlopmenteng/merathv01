/**
 * Unit tests for HijabSystem and applyHijab — targeting uncovered lines/branches
 */

import { describe, it, expect } from "vitest";
import { HijabSystem, applyHijab } from "../lib/engine/hijab";

describe("HijabSystem - applyHijab", () => {
  it("should block paternal half siblings when son exists", () => {
    const system = new HijabSystem("shafii");
    const heirs = {
      son: 1,
      half_brother_paternal: 2,
      half_sister_paternal: 1,
    };
    const { heirs: result } = system.applyHijab(heirs);
    expect(result.half_brother_paternal).toBe(0);
    expect(result.half_sister_paternal).toBe(0);
  });

  it("should not block heirs when no son exists", () => {
    const system = new HijabSystem("hanafi");
    const heirs = {
      full_brother: 2,
      full_sister: 1,
    };
    const { heirs: result } = system.applyHijab(heirs);
    expect(result.full_brother).toBe(2);
    expect(result.full_sister).toBe(1);
  });

  it("should not block grandfather when no father exists", () => {
    const system = new HijabSystem("maliki");
    const heirs = {
      grandfather: 1,
      mother: 1,
    };
    const { heirs: result } = system.applyHijab(heirs);
    expect(result.grandfather).toBe(1);
    expect(result.mother).toBe(1);
  });

  it("should block both paternal_grandfather and grandfather when father exists", () => {
    const system = new HijabSystem("hanbali");
    const heirs = {
      father: 1,
      paternal_grandfather: 1,
      grandfather: 1,
    };
    const { heirs: result } = system.applyHijab(heirs);
    expect(result.father).toBe(1);
    expect(result.paternal_grandfather).toBe(0);
    expect(result.grandfather).toBe(0);
  });

  it("should handle empty heirs", () => {
    const system = new HijabSystem("shafii");
    const { heirs: result } = system.applyHijab({});
    expect(result).toEqual({});
  });

  it("should handle heirs with zero counts", () => {
    const system = new HijabSystem("shafii");
    const heirs = { son: 0, full_brother: 2 };
    const { heirs: result } = system.applyHijab(heirs);
    // son count is 0, so siblings should not be blocked
    expect(result.full_brother).toBe(2);
  });
});

describe("HijabSystem - hasDescendants", () => {
  it("should return true when grandson exists", () => {
    const system = new HijabSystem("shafii");
    expect(system.hasDescendants({ grandson: 1 })).toBe(true);
  });

  it("should return true when granddaughter exists", () => {
    const system = new HijabSystem("shafii");
    expect(system.hasDescendants({ granddaughter: 2 })).toBe(true);
  });

  it("should return false for empty object", () => {
    const system = new HijabSystem("hanafi");
    expect(system.hasDescendants({})).toBe(false);
  });

  it("should return false for only ascendants", () => {
    const system = new HijabSystem("shafii");
    expect(
      system.hasDescendants({ father: 1, mother: 1, grandfather: 1 }),
    ).toBe(false);
  });
});

describe("HijabSystem - countMales", () => {
  it("should count all male heir types", () => {
    const system = new HijabSystem("shafii");
    const heirs = {
      son: 2,
      father: 1,
      full_brother: 1,
      half_brother_paternal: 1,
      paternal_grandfather: 1,
      grandfather: 1,
      grandson: 1,
    };
    expect(system.countMales(heirs)).toBe(8);
  });

  it("should return 0 when no males", () => {
    const system = new HijabSystem("shafii");
    expect(system.countMales({ daughter: 2, mother: 1 })).toBe(0);
  });
});

describe("HijabSystem - countFemales", () => {
  it("should count all female heir types", () => {
    const system = new HijabSystem("shafii");
    const heirs = {
      daughter: 2,
      mother: 1,
      full_sister: 1,
      half_sister_paternal: 1,
      maternal_grandmother: 1,
      granddaughter: 1,
    };
    expect(system.countFemales(heirs)).toBe(7);
  });

  it("should return 0 when no females", () => {
    const system = new HijabSystem("hanafi");
    expect(system.countFemales({ son: 2, father: 1 })).toBe(0);
  });
});

describe("HijabSystem - checkInheritanceRights", () => {
  it("should return true for all valid heir types", () => {
    const system = new HijabSystem("shafii");
    const validTypes = [
      "husband",
      "wife",
      "son",
      "daughter",
      "father",
      "mother",
      "full_brother",
      "full_sister",
      "paternal_grandfather",
      "grandfather",
      "maternal_grandmother",
      "grandson",
      "granddaughter",
      "half_brother_paternal",
      "half_sister_paternal",
    ];
    for (const type of validTypes) {
      expect(system.checkInheritanceRights(type)).toBe(true);
    }
  });

  it("should return false for invalid heir types", () => {
    const system = new HijabSystem("shafii");
    expect(system.checkInheritanceRights("pet")).toBe(false);
    expect(system.checkInheritanceRights("")).toBe(false);
    expect(system.checkInheritanceRights("neighbor")).toBe(false);
  });
});

describe("applyHijab standalone function", () => {
  it("should convert array format and apply hijab rules", () => {
    const heirs = [
      { type: "son", count: 1 },
      { type: "full_brother", count: 2 },
      { type: "daughter", count: 1 },
    ];
    const result = applyHijab(heirs);
    // son blocks full_brother
    const brotherEntry = result.find(
      (h: any) => h.type === "full_brother",
    );
    expect(brotherEntry).toBeUndefined();
    // son and daughter remain
    expect(result.find((h: any) => h.type === "son")).toBeDefined();
    expect(result.find((h: any) => h.type === "daughter")).toBeDefined();
  });

  it("should return empty when all heirs are blocked", () => {
    const heirs = [
      { type: "son", count: 1 },
      { type: "full_brother", count: 1 },
      { type: "full_sister", count: 1 },
      { type: "half_brother_paternal", count: 1 },
      { type: "half_sister_paternal", count: 1 },
    ];
    const result = applyHijab(heirs);
    // Only son should remain
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("son");
  });

  it("should handle heirs with count 0 (filtered out)", () => {
    const heirs = [
      { type: "father", count: 1 },
      { type: "full_brother", count: 0 },
    ];
    const result = applyHijab(heirs);
    expect(result.find((h: any) => h.type === "father")).toBeDefined();
    expect(result.find((h: any) => h.type === "full_brother")).toBeUndefined();
  });

  it("should handle empty heirs array", () => {
    const result = applyHijab([]);
    expect(result).toEqual([]);
  });
});
