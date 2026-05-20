import { EnhancedInheritanceCalculationEngine } from '../engine/calculator';
import { EstateInput, HeirEntry, HeirsData, MadhhabType } from '../engine/types';

export interface CalculateInheritanceInput {
  madhab?: MadhhabType;
  totalEstate?: number;
  total?: number;
  funeralExpenses?: number;
  funeral?: number;
  debts?: number;
  will?: number;
  willAmount?: number;
  heirs?: HeirEntry[];
}

export function calculateInheritance(input: CalculateInheritanceInput) {
  const estate: EstateInput = {
    total: input.totalEstate ?? input.total ?? 0,
    funeral: input.funeralExpenses ?? input.funeral ?? 0,
    debts: input.debts ?? 0,
    will: input.will ?? input.willAmount ?? 0,
  };

  const heirs: HeirEntry[] = input.heirs ?? [];
  const heirsRecord: HeirsData = {};
  heirs.forEach((h) => {
    if (h.count > 0) heirsRecord[h.type] = h.count;
  });

  const engine = new EnhancedInheritanceCalculationEngine(
    input.madhab ?? 'hanafi',
    estate,
    heirsRecord,
  );

  return engine.calculate();
}
