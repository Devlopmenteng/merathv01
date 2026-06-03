/**
 * Scenario Templates for Common Inheritance Cases
 * قوالب السيناريوهات للحالات الشائعة في المواريث
 *
 * This module provides pre-configured templates for common inheritance scenarios
 * to help users quickly set up calculations without manually entering all details.
 *
 * @module lib/templates/ScenarioTemplates
 */

import type { HeirEntry, EstateInput } from '../engine/types';
import type { MadhhabType } from '../engine/types';

/**
 * Scenario template interface
 */
export interface ScenarioTemplate {
  /** Unique identifier for the template */
  id: string;
  /** Display name of the template */
  name: string;
  /** Description of when to use this template */
  description: string;
  /** Category of the scenario (e.g., 'nuclear_family', 'complex_cases') */
  category: ScenarioCategory;
  /** Estate configuration for this template */
  estate: EstateInput;
  /** Heirs configuration for this template */
  heirs: HeirEntry[];
  /** Recommended madhab (optional - user can override) */
  recommendedMadhab?: MadhhabType;
  /** Notes about this specific scenario */
  notes?: string;
  /** Whether this is a commonly used template */
  popular: boolean;
}

/**
 * Scenario categories for organization
 */
export type ScenarioCategory =
  | 'nuclear_family'
  | 'extended_family'
  | 'special_cases'
  | 'business_owners'
  | 'no_descendants'
  | 'complex_cases';

/**
 * Pre-defined scenario templates
 */
export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  // ==================== NUCLEAR FAMILY ====================
  {
    id: 'husband_wife_children',
    name: 'Husband/Wife with Children',
    description: 'Standard family with spouse and children',
    category: 'nuclear_family',
    estate: {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'wife', count: 1 },
      { type: 'son', count: 2 },
      { type: 'daughter', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
    popular: true,
  },
  {
    id: 'husband_wife_no_children',
    name: 'Husband/Wife with No Children',
    description: 'Married couple with no descendants',
    category: 'nuclear_family',
    estate: {
      total: 80000,
      funeral: 4000,
      debts: 0,
      will: 0,
    },
    heirs: [{ type: 'wife', count: 1 }],
    recommendedMadhab: 'hanafi',
    popular: true,
  },
  {
    id: 'father_mother_children',
    name: 'Father and Mother with Children',
    description: 'Children inherit with both parents',
    category: 'nuclear_family',
    estate: {
      total: 150000,
      funeral: 6000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'father', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'son', count: 2 },
      { type: 'daughter', count: 1 },
    ],
    popular: true,
  },
  {
    id: 'single_parent_children',
    name: 'Single Parent with Children',
    description: 'One parent with children (no spouse)',
    category: 'nuclear_family',
    estate: {
      total: 120000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'mother', count: 1 },
      { type: 'son', count: 3 },
    ],
    recommendedMadhab: 'hanafi',
  },
  {
    id: 'daughters_only',
    name: 'Daughters Only',
    description: 'Only daughters as heirs (Radd applies)',
    category: 'nuclear_family',
    estate: {
      total: 90000,
      funeral: 4000,
      debts: 0,
      will: 0,
    },
    heirs: [{ type: 'daughter', count: 2 }],
    recommendedMadhab: 'shafii',
    notes: 'Radd (رد) will apply - daughters receive remaining estate after their fixed shares',
    popular: true,
  },
  {
    id: 'sons_only',
    name: 'Sons Only',
    description: 'Only sons as heirs (Asaba)',
    category: 'nuclear_family',
    estate: {
      total: 200000,
      funeral: 8000,
      debts: 0,
      will: 0,
    },
    heirs: [{ type: 'son', count: 3 }],
    recommendedMadhab: 'hanafi',
    notes: 'Sons are Asaba (عصبة) and receive entire estate',
  },

  // ==================== EXTENDED FAMILY ====================
  {
    id: 'grandparents_children',
    name: 'Grandparents with Grandchildren',
    description: 'Paternal grandparents with grandchildren',
    category: 'extended_family',
    estate: {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'grandfather', count: 1 },
      { type: 'grandmother_mother', count: 1 },
      { type: 'grandson', count: 2 },
    ],
  },
  {
    id: 'siblings_only',
    name: 'Siblings Only',
    description: 'Full brothers and/or sisters as heirs',
    category: 'extended_family',
    estate: {
      total: 75000,
      funeral: 3500,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'full_brother', count: 2 },
      { type: 'full_sister', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
  },
  {
    id: 'siblings_with_parents',
    name: 'Siblings with Parents',
    description: 'Full siblings inherit with father',
    category: 'extended_family',
    estate: {
      total: 180000,
      funeral: 7000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'father', count: 1 },
      { type: 'full_brother', count: 2 },
      { type: 'full_sister', count: 1 },
    ],
    notes: 'Father blocks siblings in most cases - they may receive nothing',
  },
  {
    id: 'maternal_siblings',
    name: 'Maternal Siblings',
    description: 'Maternal brothers and/or sisters',
    category: 'extended_family',
    estate: {
      total: 60000,
      funeral: 3000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'maternal_brother', count: 2 },
      { type: 'maternal_sister', count: 1 },
    ],
    notes: 'Maternal siblings receive 1/3 of estate divided equally',
  },
  {
    id: 'paternal_siblings',
    name: 'Paternal Siblings',
    description: 'Paternal brothers and/or sisters',
    category: 'extended_family',
    estate: {
      total: 85000,
      funeral: 4000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'paternal_brother', count: 2 },
      { type: 'paternal_sister', count: 1 },
    ],
  },

  // ==================== SPECIAL CASES ====================
  {
    id: 'musharraka_case',
    name: 'Musharraka (المشتركة)',
    description: 'Grandfather with full siblings - Shafii special case',
    category: 'special_cases',
    estate: {
      total: 120000,
      funeral: 6000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'grandfather', count: 1 },
      { type: 'full_brother', count: 2 },
      { type: 'full_sister', count: 1 },
    ],
    recommendedMadhab: 'shafii',
    notes: 'Shafii madhab: Grandfather shares with siblings via Musharraka',
  },
  {
    id: 'akdariyya_case',
    name: 'Akdariyya (الأكدرية)',
    description: 'Grandfather with single sister',
    category: 'special_cases',
    estate: {
      total: 90000,
      funeral: 4500,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'grandfather', count: 1 },
      { type: 'full_sister', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
    notes: 'Special case where grandfather receives reduced share with single sister',
  },
  {
    id: 'awl_case',
    name: 'Awl (عول) - Shares Exceed Estate',
    description: 'Case where fixed shares sum exceeds estate base',
    category: 'special_cases',
    estate: {
      total: 24000,
      funeral: 2000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'wife', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'father', count: 1 },
      { type: 'daughter', count: 2 },
    ],
    notes: 'Fixed shares (24) exceed estate base (24) - Awl applies',
  },
  {
    id: 'radd_case',
    name: 'Radd (رد) - Shares Less Than Estate',
    description: 'Case where fixed shares are less than estate',
    category: 'special_cases',
    estate: {
      total: 60000,
      funeral: 3000,
      debts: 0,
      will: 0,
    },
    heirs: [{ type: 'daughter', count: 2 }],
    recommendedMadhab: 'shafii',
    notes: 'Daughters get 2/3, remaining 1/3 returns via Radd',
  },
  {
    id: 'grandfather_optimal_selection',
    name: 'Grandfather Optimal Selection',
    description: 'Grandfather chooses best option: muqasamah, 1/6, or 1/3',
    category: 'special_cases',
    estate: {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'grandfather', count: 1 },
      { type: 'full_brother', count: 2 },
    ],
    recommendedMadhab: 'maliki',
    notes: 'Engine evaluates all options and selects most beneficial for grandfather',
  },

  // ==================== BUSINESS OWNERS ====================
  {
    id: 'business_owner_family',
    name: 'Business Owner with Family',
    description: 'Large estate with spouse and children',
    category: 'business_owners',
    estate: {
      total: 500000,
      funeral: 20000,
      debts: 50000,
      will: 30000,
    },
    heirs: [
      { type: 'wife', count: 1 },
      { type: 'son', count: 3 },
      { type: 'daughter', count: 2 },
    ],
    recommendedMadhab: 'hanafi',
    notes: 'Includes debts and will - will limited to 1/3 of net estate',
    popular: true,
  },
  {
    id: 'property_investor',
    name: 'Property Investor',
    description: 'Real estate portfolio with family',
    category: 'business_owners',
    estate: {
      total: 1000000,
      funeral: 30000,
      debts: 100000,
      will: 50000,
    },
    heirs: [
      { type: 'husband', count: 1 },
      { type: 'son', count: 2 },
      { type: 'daughter', count: 2 },
      { type: 'father', count: 1 },
      { type: 'mother', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
  },

  // ==================== NO DESCENDANTS ====================
  {
    id: 'spouse_parents_only',
    name: 'Spouse with Parents Only',
    description: 'Married with parents, no children',
    category: 'no_descendants',
    estate: {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'wife', count: 1 },
      { type: 'father', count: 1 },
      { type: 'mother', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
  },
  {
    id: 'spouse_grandparents_only',
    name: 'Spouse with Grandparents Only',
    description: 'Married with grandparents, no closer relatives',
    category: 'no_descendants',
    estate: {
      total: 80000,
      funeral: 4000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'husband', count: 1 },
      { type: 'grandfather', count: 1 },
      { type: 'grandmother_mother', count: 1 },
    ],
  },
  {
    id: 'siblings_spouse',
    name: 'Spouse with Siblings',
    description: 'Married with siblings, no children or parents',
    category: 'no_descendants',
    estate: {
      total: 90000,
      funeral: 4500,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'wife', count: 1 },
      { type: 'full_brother', count: 2 },
      { type: 'full_sister', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
  },

  // ==================== COMPLEX CASES ====================
  {
    id: 'blood_relatives_priority',
    name: 'Blood Relatives (ذوو الأرحام)',
    description: 'Distant relatives when no fixed sharers or asaba',
    category: 'complex_cases',
    estate: {
      total: 50000,
      funeral: 2500,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'daughter_son', count: 2 },
      { type: 'daughter_daughter', count: 1 },
    ],
    recommendedMadhab: 'shafii',
    notes: 'Blood relatives inherit by priority classes when no primary heirs exist',
  },
  {
    id: 'complex_family_structure',
    name: 'Complex Family Structure',
    description: 'Multiple generations and family branches',
    category: 'complex_cases',
    estate: {
      total: 250000,
      funeral: 10000,
      debts: 20000,
      will: 15000,
    },
    heirs: [
      { type: 'wife', count: 1 },
      { type: 'son', count: 1 },
      { type: 'daughter', count: 1 },
      { type: 'father', count: 1 },
      { type: 'mother', count: 1 },
      { type: 'full_brother', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
  },
  {
    id: 'multiple_wives',
    name: 'Multiple Wives (Maximum 4)',
    description: 'Deceased with multiple wives',
    category: 'complex_cases',
    estate: {
      total: 300000,
      funeral: 15000,
      debts: 0,
      will: 0,
    },
    heirs: [
      { type: 'wife', count: 4 },
      { type: 'son', count: 2 },
      { type: 'daughter', count: 1 },
    ],
    recommendedMadhab: 'hanafi',
    notes: 'Islamic law allows maximum 4 wives',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ScenarioCategory): ScenarioTemplate[] {
  return SCENARIO_TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get popular templates
 */
export function getPopularTemplates(): ScenarioTemplate[] {
  return SCENARIO_TEMPLATES.filter((template) => template.popular);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ScenarioTemplate | undefined {
  return SCENARIO_TEMPLATES.find((template) => template.id === id);
}

/**
 * Search templates by name or description
 */
export function searchTemplates(query: string): ScenarioTemplate[] {
  const lowerQuery = query.toLowerCase();
  return SCENARIO_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all categories
 */
export function getAllCategories(): ScenarioCategory[] {
  const categories = new Set(SCENARIO_TEMPLATES.map((template) => template.category));
  return Array.from(categories);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: ScenarioCategory): string {
  const names: Record<ScenarioCategory, string> = {
    nuclear_family: 'Nuclear Family',
    extended_family: 'Extended Family',
    special_cases: 'Special Cases',
    business_owners: 'Business Owners',
    no_descendants: 'No Descendants',
    complex_cases: 'Complex Cases',
  };
  return names[category];
}

/**
 * Apply template to calculation state
 */
export function applyTemplate(template: ScenarioTemplate): {
  estate: EstateInput;
  heirs: HeirEntry[];
  recommendedMadhab?: MadhhabType;
} {
  return {
    estate: { ...template.estate },
    heirs: [...template.heirs],
    recommendedMadhab: template.recommendedMadhab,
  };
}
