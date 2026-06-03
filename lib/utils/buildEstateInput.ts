import type { EstateInput } from '../engine/types';

export function buildEstateInput(state: {
  total: number;
  funeral: number;
  debts: number;
  will: number;
}): EstateInput {
  return {
    total: state.total,
    funeral: state.funeral,
    debts: state.debts,
    will: state.will,
  };
}
