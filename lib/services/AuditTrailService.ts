import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../constants/appDefaults';
import type { HeirShare } from '../engine/types';
import { offlineCacheService } from './OfflineCacheService';
import { SecureStorageService } from './SecureStorageService';

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

/**
 * Sensitive audit entry data (stored securely)
 */
interface SecureAuditEntry {
  netTotal: number;
  shares: HeirShare[];
  steps: { title: string; description: string }[];
  hijabLog?: string[] | undefined;
}

/**
 * Non-sensitive audit metadata (stored in regular storage for search)
 */
interface AuditEntryMetadata {
  id: string;
  timestamp: string;
  madhab: string;
  caseName?: string | undefined;
  caseDate?: string | undefined;
  secureId: string; // Reference to secure storage
}

export async function saveAuditTrail(entry: AuditEntry) {
  // Extract sensitive data for secure storage
  const secureData: SecureAuditEntry = {
    netTotal: entry.netTotal,
    shares: entry.shares,
    steps: entry.steps,
    hijabLog: entry.hijabLog || undefined,
  };

  // Generate unique ID for secure storage
  const secureId = `audit_${entry.id}`;
  
  // Store sensitive data securely
  await SecureStorageService.setItem(secureId, secureData);

  // Store only metadata in regular storage
  const metadata: AuditEntryMetadata = {
    id: entry.id,
    timestamp: entry.timestamp,
    madhab: entry.madhab,
    caseName: entry.caseName,
    caseDate: entry.caseDate,
    secureId,
  };

  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const trail: AuditEntryMetadata[] = stored ? JSON.parse(stored) : [];
  trail.unshift(metadata);
  
  if (trail.length > APP_DEFAULTS.MAX_AUDIT_ENTRIES) {
    const removed = trail.pop();
    if (removed) {
      // Clean up secure storage for removed entry
      await SecureStorageService.removeItem(removed.secureId);
    }
  }
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trail));

  // Update cache with metadata only
  await offlineCacheService.set(CACHE_KEY, trail, CACHE_TTL);
}

export async function getAuditTrail(): Promise<AuditEntry[]> {
  // Try cache first (metadata only)
  const cached = await offlineCacheService.get<AuditEntryMetadata[]>(CACHE_KEY);
  const metadataList = cached || await AsyncStorage.getItem(STORAGE_KEY).then(stored => 
    stored ? JSON.parse(stored) as AuditEntryMetadata[] : []
  );

  if (!metadataList || metadataList.length === 0) {
    return [];
  }

  // Cache for next time
  if (metadataList.length > 0 && !cached) {
    await offlineCacheService.set(CACHE_KEY, metadataList, CACHE_TTL);
  }

  // Retrieve secure data for each entry
  const fullEntries: AuditEntry[] = [];
  for (const metadata of metadataList) {
    const secureData = await SecureStorageService.getItem<SecureAuditEntry>(metadata.secureId);
    if (secureData) {
      const entry: AuditEntry = {
        id: metadata.id,
        timestamp: metadata.timestamp,
        madhab: metadata.madhab,
        netTotal: secureData.netTotal,
        shares: secureData.shares,
        steps: secureData.steps,
      };
      
      // Only add optional properties if they exist
      if (secureData.hijabLog) {
        entry.hijabLog = secureData.hijabLog;
      }
      
      if (metadata.caseName) {
        entry.caseName = metadata.caseName;
      }
      
      if (metadata.caseDate) {
        entry.caseDate = metadata.caseDate;
      }
      
      fullEntries.push(entry);
    }
  }

  return fullEntries;
}

export async function clearAuditTrail() {
  // Clear all secure storage entries for audit trail
  const metadataList = await AsyncStorage.getItem(STORAGE_KEY).then(stored => 
    stored ? JSON.parse(stored) as AuditEntryMetadata[] : []
  );
  
  for (const metadata of metadataList) {
    await SecureStorageService.removeItem(metadata.secureId);
  }
  
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
