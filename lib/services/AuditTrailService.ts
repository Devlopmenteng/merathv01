import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import type { HeirShare } from '../engine/types';
import { offlineCacheService } from './OfflineCacheService';

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
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_KEY = 'audit_trail';

export async function saveAuditTrail(entry: AuditEntry) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const trail: AuditEntry[] = stored ? JSON.parse(stored) : [];
  trail.unshift(entry);
  if (trail.length > APP_DEFAULTS.MAX_AUDIT_ENTRIES) trail.pop();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trail));

  // Update cache
  await offlineCacheService.set(CACHE_KEY, trail, CACHE_TTL);
}

export async function getAuditTrail(): Promise<AuditEntry[]> {
  // Try cache first
  const cached = await offlineCacheService.get<AuditEntry[]>(CACHE_KEY);
  if (cached) {
    return cached;
  }

  // Fallback to AsyncStorage
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const trail: AuditEntry[] = stored ? JSON.parse(stored) : [];

  // Cache for next time
  if (trail.length > 0) {
    await offlineCacheService.set(CACHE_KEY, trail, CACHE_TTL);
  }

  return trail;
}

export async function clearAuditTrail() {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await offlineCacheService.remove(CACHE_KEY);
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

export async function getCachedAuditTrailCount(): Promise<number> {
  const trail = await getAuditTrail();
  return trail.length;
}
