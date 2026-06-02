import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import type { HeirShare } from '../engine/types';

export interface AuditEntry {
  id: string;
  timestamp: string;
  madhab: string;
  netTotal: number;
  shares: HeirShare[];
  steps: { title: string; description: string }[];
  hijabLog?: string[];
  caseName?: string;
  caseDate?: string;
}

const STORAGE_KEY = APP_DEFAULTS.STORAGE_KEYS.AUDIT_TRAIL;

export async function saveAuditTrail(entry: AuditEntry) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const trail: AuditEntry[] = stored ? JSON.parse(stored) : [];
  trail.unshift(entry);
  if (trail.length > APP_DEFAULTS.MAX_AUDIT_ENTRIES) trail.pop();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
}

export async function getAuditTrail(): Promise<AuditEntry[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function clearAuditTrail() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function searchAuditTrail(query: string): Promise<AuditEntry[]> {
  const all = await getAuditTrail();
  const lowerQuery = query.toLowerCase();
  return all.filter(
    (entry) =>
      entry.caseName?.toLowerCase().includes(lowerQuery) ||
      entry.caseDate?.includes(lowerQuery) ||
      entry.madhab.toLowerCase().includes(lowerQuery)
  );
}
