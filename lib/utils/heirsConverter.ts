import { HeirEntry, HeirsData } from '../engine/types';
export function heirsArrayToObject(heirs: HeirEntry[]): HeirsData {
  const obj: HeirsData = {};
  heirs.forEach((h) => {
    obj[h.type] = h.count;
  });
  return obj;
}
