import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuditEntry {
  id: string;
  timestamp: string;
  madhab: string;
  netTotal: number;
  shares: any[];
  steps: { title: string; description: string }[];
  hijabLog?: string[];
  caseName?: string;
  caseDate?: string;
}

const STORAGE_KEY = 'merath_audit_trail';

function safeParse(stored: string | null): AuditEntry[] {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAuditTrail(entry: AuditEntry) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const trail = safeParse(stored);
  trail.unshift(entry);
  if (trail.length > 50) trail.pop();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
}

export async function getAuditTrail(): Promise<AuditEntry[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return safeParse(stored);
}

export async function clearAuditTrail() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function searchAuditTrail(query: string): Promise<AuditEntry[]> {
  const all = await getAuditTrail();
  const lowerQuery = query.toLowerCase();
  return all.filter(entry => 
    entry.caseName?.toLowerCase().includes(lowerQuery) ||
    entry.caseDate?.includes(lowerQuery) ||
    entry.madhab.toLowerCase().includes(lowerQuery)
  );
}
