import { HeirType } from '../engine/types';

type IconConfig = {
  icon: string;
  color: string;
};

export const HEIR_ICONS: Record<HeirType, IconConfig> = {
  husband: { icon: '👨', color: '#2E6B8A' },
  wife: { icon: '👩', color: '#A93545' },
  father: { icon: '👨', color: '#5C5347' },
  mother: { icon: '👩', color: '#5C5347' },
  grandfather: { icon: '👴', color: '#7B5EA7' },
  grandmother_mother: { icon: '👵', color: '#7B5EA7' },
  grandmother_father: { icon: '👵', color: '#7B5EA7' },
  son: { icon: '👶', color: '#1B5E3B' },
  daughter: { icon: '👧', color: '#1B5E3B' },
  grandson: { icon: '🧒', color: '#1B5E3B' },
  granddaughter: { icon: '🧒', color: '#1B5E3B' },
  full_brother: { icon: '👨', color: '#C8923C' },
  full_sister: { icon: '👩', color: '#C8923C' },
  paternal_brother: { icon: '👨', color: '#C8923C' },
  paternal_sister: { icon: '👩', color: '#C8923C' },
  maternal_brother: { icon: '👨', color: '#B87D3A' },
  maternal_sister: { icon: '👩', color: '#B87D3A' },
  full_nephew: { icon: '🧑', color: '#1A6B7A' },
  paternal_nephew: { icon: '🧑', color: '#1A6B7A' },
  full_uncle: { icon: '🧔', color: '#1A6B7A' },
  paternal_uncle: { icon: '🧔', color: '#1A6B7A' },
  full_cousin: { icon: '🧑', color: '#4A7C59' },
  paternal_cousin: { icon: '🧑', color: '#4A7C59' },
  maternal_uncle: { icon: '🧔', color: '#1A6B7A' },
  maternal_aunt: { icon: '🧑', color: '#1A6B7A' },
  paternal_aunt: { icon: '🧑', color: '#1A6B7A' },
  daughter_son: { icon: '🧒', color: '#3A8B7C' },
  daughter_daughter: { icon: '🧒', color: '#3A8B7C' },
  sister_children: { icon: '🧑', color: '#3A8B7C' },
  treasury: { icon: '🏛️', color: '#5C5347' },
  shared_siblings: { icon: '👥', color: '#C8923C' },
} as Record<HeirType, IconConfig>;
