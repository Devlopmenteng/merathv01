/**
 * Asaba (residuaries) calculation module
 */
import { FractionClass } from '../fraction';
import type { HeirsData } from '../types';
import { FIQH_DATABASE } from '../constants';

  private computeAsaba(
    _fixedShares: HeirShareObject[],
    remainder: FractionClass,
    heirs: HeirsData,
  ): HeirShareObject[] {
    void _fixedShares;
    if (remainder.toDecimal() <= 0.0001) {
      return [];
    }

    const asabaShares: HeirShareObject[] = [];

    if (heirs.son && heirs.son > 0) {
      const totalHeads = heirs.son * 2 + (heirs.daughter || 0);
      const sonWeight = heirs.son * 2;
      const daughterWeight = heirs.daughter || 0;

      if (sonWeight > 0) {
        asabaShares.push({
          key: "son",
          name: "الابن",
          type: "تعصيب",
          fraction: remainder.multiply(
            new FractionClass(sonWeight, totalHeads),
          ),
          count: heirs.son || 0,
          reason: `${heirs.son} ابن(ة) يرثون الباقي`,
        });
      }

      if (daughterWeight > 0) {
        asabaShares.push({
          key: "daughter",
          name: "البنت",
          type: "تعصيب",
          fraction: remainder.multiply(
            new FractionClass(daughterWeight, totalHeads),
          ),
          count: heirs.daughter || 0,
          reason: "البنات مع الابن",
        });
      }

      return asabaShares;
    }

    if (heirs.grandson && heirs.grandson > 0) {
      const totalHeads = heirs.grandson * 2 + (heirs.granddaughter || 0);

      asabaShares.push({
        key: "grandson",
        name: "ابن الابن",
        type: "تعصيب",
        fraction: remainder.multiply(
          new FractionClass(heirs.grandson * 2, totalHeads),
        ),
        count: heirs.grandson || 0,
        reason: "ابن الابن يرث الباقي",
      });

      if (heirs.granddaughter && heirs.granddaughter > 0) {
        asabaShares.push({
          key: "granddaughter",
          name: "بنت الابن",
          type: "تعصيب",
          fraction: remainder.multiply(
            new FractionClass(heirs.granddaughter, totalHeads),
          ),
          count: heirs.granddaughter || 0,
          reason: "بنات الابن مع الابن",
        });
      }

      return asabaShares;
    }

    if (heirs.father && heirs.father > 0) {
      asabaShares.push({
        key: "father",
        name: "الأب",
        type: "تعصيب",
        fraction: remainder,
        count: 1,
        reason: "الأب يرث الباقي",
        addToExisting: true,
      });
      return asabaShares;
    }

    if (heirs.grandfather && heirs.grandfather > 0 && !heirs.father) {
      const siblingsCount = this.getFullAndPaternalSiblingsCount();
      console.log(
        "Grandfather block entered. siblingsCount:",
        siblingsCount,
        "madhab:",
        this.madhab,
      );

      const madhabConfig = FIQH_DATABASE.madhabs[this.madhab];
      const shouldShare =
        madhabConfig?.rules.grandfather_with_siblings === "musharak";

      console.log("Madhab config from constants:", madhabConfig);
      console.log(
        "Rule value from config:",
        madhabConfig?.rules.grandfather_with_siblings,
      );
      console.log("Should share based on rule?", shouldShare);

      if (siblingsCount > 0 && shouldShare) {
        console.log("Entering sharing branch (muqasamah)");
        console.log("heirs.full_brother:", heirs.full_brother);
        console.log("heirs.full_sister:", heirs.full_sister);
        const totalHeadsCalc =
          2 +
          (heirs.full_brother || 0) * 2 +
          (heirs.full_sister || 0) +
          (heirs.half_brother_paternal || 0) * 2 +
          (heirs.half_sister_paternal || 0);
        console.log("totalHeads calculated:", totalHeadsCalc);
        const totalHeads =
          2 +
          (heirs.full_brother || 0) * 2 +
          (heirs.full_sister || 0) +
          (heirs.half_brother_paternal || 0) * 2 +
          (heirs.half_sister_paternal || 0);

        const byMuqasamah = new FractionClass(2, totalHeads);
        const byThird = new FractionClass(1, 3);
        const bySixth = new FractionClass(1, 6);

        console.log("Grandfather options:", {
          totalHeads,
          byMuqasamah: byMuqasamah.toString(),
          byMuqasamahDecimal: byMuqasamah.toDecimal(),
          byThird: byThird.toString(),
          byThirdDecimal: byThird.toDecimal(),
          bySixth: bySixth.toString(),
          bySixthDecimal: bySixth.toDecimal(),
        });

        let bestOption = byMuqasamah;
        let bestReason = "muqasamah";
        let bestValue = byMuqasamah.toDecimal();

        const thirdValue = byThird.toDecimal();
        if (thirdValue > bestValue) {
          bestOption = byThird;
          bestReason = "third";
          bestValue = thirdValue;
        }

        const sixthValue = bySixth.toDecimal();
        if (sixthValue > bestValue) {
          bestOption = bySixth;
          bestReason = "sixth";
          bestValue = sixthValue;
        }

        console.log("Chosen option:", {
          bestReason,
          bestOption: bestOption.toString(),
        });

        this.steps.push({
          step: "اختيار الأفضل للجد مع الإخوة",
          description: `تم اختيار ${
            bestReason === "muqasamah"
              ? "المقاسمة"
              : bestReason === "third"
                ? "الثلث"
                : "السدس"
          } (${bestOption.toString()})`,
          code: "grandfather_optimal",
          data: { bestOption: bestOption.toString(), bestReason },
        });

        asabaShares.push({
          key: "grandfather",
          name: "الجد",
          type: "تعصيب",
          fraction: bestOption,
          count: 1,
          reason: `${
            bestReason === "muqasamah"
              ? "المقاسمة مع الإخوة"
              : bestReason === "third"
                ? "ثلث المال"
                : "سدس المال"
          } (الأفضل)`,
          addToExisting: true,
        });

        if (bestReason === "muqasamah") {
          console.log(
            "Adding siblings shares via muqasamah. remainder:",
            remainder.toString(),
          );
          if (heirs.full_brother && heirs.full_brother > 0) {
            const brotherFrac = remainder.multiply(
              new FractionClass(heirs.full_brother * 2, totalHeads),
            );
            console.log("full_brother fraction:", brotherFrac.toString());
            asabaShares.push({
              key: "full_brother",
              name: "الأخ الشقيق",
              type: "تعصيب",
              fraction: brotherFrac,
              count: heirs.full_brother || 0,
              reason: "مع الجد بالمقاسمة",
            });
          }

          if (heirs.full_sister && heirs.full_sister > 0) {
            const sisterFrac = remainder.multiply(
              new FractionClass(heirs.full_sister, totalHeads),
            );
            console.log("full_sister fraction:", sisterFrac.toString());
            asabaShares.push({
              key: "full_sister",
              name: "الأخت الشقيقة",
              type: "تعصيب",
              fraction: sisterFrac,
              count: heirs.full_sister || 0,
              reason: "مع الجد بالمقاسمة",
            });
          }

          if (heirs.half_brother_paternal && heirs.half_brother_paternal > 0) {
            asabaShares.push({
              key: "half_brother_paternal",
              name: "الأخ لأب",
              type: "تعصيب",
              fraction: remainder.multiply(
                new FractionClass(heirs.half_brother_paternal * 2, totalHeads),
              ),
              count: heirs.half_brother_paternal || 0,
              reason: "مع الجد بالمقاسمة",
            });
          }

          if (heirs.half_sister_paternal && heirs.half_sister_paternal > 0) {
            asabaShares.push({
              key: "half_sister_paternal",
              name: "الأخت لأب",
              type: "تعصيب",
              fraction: remainder.multiply(
                new FractionClass(heirs.half_sister_paternal, totalHeads),
              ),
              count: heirs.half_sister_paternal || 0,
              reason: "مع الجد بالمقاسمة",
            });
          }
        }

        return asabaShares;
      } else if (siblingsCount > 0 && !shouldShare) {
        console.log("Entering blocking branch (grandfather takes all)");
        asabaShares.push({
          key: "grandfather",
          name: "الجد",
          type: "تعصيب",
          fraction: remainder,
          count: 1,
          reason: "الجد يرث الباقي (يَحجب الإخوة)",
          addToExisting: true,
        });
        return asabaShares;
      } else {
        console.log("Entering no-siblings branch");
        asabaShares.push({
          key: "grandfather",
          name: "الجد",
          type: "تعصيب",
          fraction: remainder,
          count: 1,
          reason: "الجد يرث الباقي",
          addToExisting: true,
        });
        return asabaShares;
      }
    }

    if (heirs.full_brother && heirs.full_brother > 0) {
      const totalHeads = heirs.full_brother * 2 + (heirs.full_sister || 0);

      asabaShares.push({
        key: "full_brother",
        name: "الأخ الشقيق",
        type: "تعصيب",
        fraction: remainder.multiply(
          new FractionClass(heirs.full_brother * 2, totalHeads),
        ),
        count: heirs.full_brother || 0,
        reason: "الأخ الشقيق يعصب الأخت",
      });

      if (heirs.full_sister && heirs.full_sister > 0) {
        asabaShares.push({
          key: "full_sister",
          name: "الأخت الشقيقة",
          type: "تعصيب",
          fraction: remainder.multiply(
            new FractionClass(heirs.full_sister, totalHeads),
          ),
          count: heirs.full_sister || 0,
          reason: "الأخت الشقيقة مع الأخ",
        });
      }

      return asabaShares;
    }

    if (heirs.half_brother_paternal && heirs.half_brother_paternal > 0) {
      const totalHeads =
        heirs.half_brother_paternal * 2 + (heirs.half_sister_paternal || 0);

      asabaShares.push({
        key: "half_brother_paternal",
        name: "الأخ لأب",
        type: "تعصيب",
        fraction: remainder.multiply(
          new FractionClass(heirs.half_brother_paternal * 2, totalHeads),
        ),
        count: heirs.half_brother_paternal || 0,
        reason: "الأخ لأب يعصب الأخت",
      });

      if (heirs.half_sister_paternal && heirs.half_sister_paternal > 0) {
        asabaShares.push({
          key: "half_sister_paternal",
          name: "الأخت لأب",
          type: "تعصيب",
          fraction: remainder.multiply(
            new FractionClass(heirs.half_sister_paternal, totalHeads),
          ),
          count: heirs.half_sister_paternal || 0,
          reason: "الأخت لأب مع الأخ",
        });
      }

      return asabaShares;
    }

    if (heirs.uncle_paternal && heirs.uncle_paternal > 0) {
      asabaShares.push({
        key: "uncle_paternal",
        name: "العم",
        type: "تعصيب",
        fraction: remainder.divide(heirs.uncle_paternal),
        count: heirs.uncle_paternal || 0,
        reason: "العم يرث الباقي",
      });
      return asabaShares;
    }

    if (heirs.nephew_from_brother && heirs.nephew_from_brother > 0) {
      asabaShares.push({
        key: "nephew_from_brother",
        name: "ابن الأخ",
        type: "تعصيب",
        fraction: remainder.divide(heirs.nephew_from_brother),
        count: heirs.nephew_from_brother || 0,
        reason: "ابن الأخ يرث الباقي",
      });
      return asabaShares;
    }

    return asabaShares;
  }

  private getFullAndPaternalSiblingsCount(): number {
    return (
      (this.heirs.full_brother || 0) +
      (this.heirs.full_sister || 0) +
      (this.heirs.half_brother_paternal || 0) +
      (this.heirs.half_sister_paternal || 0)
    );
  }

