import { HeirType } from '../engine/types';

type IconConfig = {
  icon: string;
  color: string;
};

export const HEIR_ICONS: Record<HeirType, IconConfig> = {
  husband: { icon: '👨', color: '#3B82F6' },
  wife: { icon: '👩', color: '#EC4899' },
  father: { icon: '👨', color: '#6B7280' },
  mother: { icon: '👩', color: '#6B7280' },
  grandfather: { icon: '👴', color: '#8B5CF6' },
  grandmother_mother: { icon: '👵', color: '#8B5CF6' },
  grandmother_father: { icon: '👵', color: '#8B5CF6' },
  son: { icon: '👶', color: '#10B981' },
  daughter: { icon: '👧', color: '#10B981' },
  grandson: { icon: '🧒', color: '#10B981' },
  granddaughter: { icon: '🧒', color: '#10B981' },
  full_brother: { icon: '👨', color: '#F59E0B' },
  full_sister: { icon: '👩', color: '#F59E0B' },
  paternal_brother: { icon: '👨', color: '#F59E0B' },
  paternal_sister: { icon: '👩', color: '#F59E0B' },
  maternal_brother: { icon: '👨', color: '#F59E0B' },
  maternal_sister: { icon: '👩', color: '#F59E0B' },
  full_nephew: { icon: '🧑', color: '#A855F7' },
  paternal_nephew: { icon: '🧑', color: '#A855F7' },
  full_uncle: { icon: '🧔', color: '#A855F7' },
  paternal_uncle: { icon: '🧔', color: '#A855F7' },
  full_cousin: { icon: '🧑', color: '#A855F7' },
  paternal_cousin: { icon: '🧑', color: '#A855F7' },
  maternal_uncle: { icon: '🧔', color: '#A855F7' },
  maternal_aunt: { icon: '🧑', color: '#A855F7' },
  paternal_aunt: { icon: '🧑', color: '#A855F7' },
  daughter_son: { icon: '🧒', color: '#14B8A6' },
  daughter_daughter: { icon: '🧒', color: '#14B8A6' },
  sister_children: { icon: '🧑', color: '#14B8A6' },
  // Additional types that might be present in HeirType (add if needed)
  treasury: { icon: '🏛️', color: '#6B7280' },
  shared_siblings: { icon: '👥', color: '#F59E0B' },
} as Record<HeirType, IconConfig>;
