import { t } from '../i18n';

/**
 * Maps engine Arabic share type strings → i18n keys.
 * Engine outputs Arabic type labels; this maps them to localized strings.
 */
const SHARE_TYPE_MAP: Record<string, string> = {
  فرض: 'share_type_fard',
  تعصيب: 'share_type_asaba',
  'فرض + تعصيب': 'share_type_fard_asaba',
  'تعصيب مع الغير': 'share_type_asaba_with_others',
  'ذو رحم': 'share_type_blood_relative',
  'بيت المال': 'share_type_treasury',
};

/**
 * Maps engine Arabic reason strings → i18n keys.
 */
const REASON_MAP: Record<string, string> = {
  // Husband reasons
  '½ لعدم وجود فرع وارث': 'reason_half_no_descendants',
  '½ بدون فرع وارث': 'reason_half_no_descendants',
  '¼ مع وجود الفرع الوارث': 'reason_quarter_with_descendants',
  // Wife reasons
  '⅛ مع الفرع الوارث': 'reason_eighth_with_descendants',
  '¼ بدون فرع': 'reason_quarter_no_descendants',
  // Mother reasons
  '⅙ مع جمع إخوة': 'reason_sixth_with_siblings',
  '⅙ لوجود جمع من الإخوة': 'reason_sixth_with_siblings',
  'ثلث الباقي بعد نصيب الزوج (العُمَريَّة الأولى)': 'reason_umariyyah_first',
  'ثلث الباقي بعد نصيب الزوجة (العُمَريَّة الثانية)': 'reason_umariyyah_second',
  // Father reasons
  '⅙ فرضاً لوجود الفرع الوارث الذكر': 'reason_sixth_fard_male_descendants',
  '⅙ فرضاً + الباقي تعصيباً لوجود فرع وارث أنثى فقط': 'reason_sixth_fard_plus_residuary_female',
  'الأب يرث الباقي تعصيباً': 'reason_father_residuary',
  'الأب يرث الباقي': 'reason_father_residuary_all',
  // Grandfather reasons
  'الجد يرث الباقي تعصيباً': 'reason_grandfather_residuary',
  'الجد يرث الباقي': 'reason_grandfather_residuary_all',
  'الجد يرث الباقي (يَحجب الإخوة)': 'reason_grandfather_residuary_blocks_siblings',
  // Grandmother reasons
  '⅙ يشتركن فيه': 'reason_sixth_shared_grandmothers',
  // Daughter reasons
  '½': 'reason_half',
  '⅔': 'reason_two_thirds',
  '⅙': 'reason_sixth',
  // Granddaughter reasons
  '⅙ تكملة للثلثين': 'reason_sixth_completion',
  // Sister reasons
  '⅙ تكملة للثلثين مع الأخت الشقيقة': 'reason_sixth_completion_with_full_sister',
  'عاصبة مع الغير لوجود فرع وارث أنثى': 'reason_asaba_with_others_female_descendants',
  // Maternal siblings
  '⅓': 'reason_third',
  '⅓ يشتركون فيه بالتساوي (المسألة المشتركة)': 'reason_third_shared_musharraka',
  // Asaba reasons
  'البنات مع الابن': 'reason_daughters_with_son',
  'ابن الابن يرث الباقي': 'reason_grandson_residuary',
  'بنات الابن مع الابن': 'reason_granddaughters_with_grandson',
  'الأخ الشقيق يعصب الأخت': 'reason_full_brother_asaba_sister',
  'الأخت الشقيقة مع الأخ': 'reason_full_sister_with_brother',
  'الأخ لأب يعصب الأخت': 'reason_paternal_brother_asaba_sister',
  'الأخت لأب مع الأخ': 'reason_paternal_sister_with_brother',
  'مع الجد بالمقاسمة': 'reason_with_grandfather_muqasamah',
  // Treasury
  'لا يوجد ورثة - التركة لبيت المال الإسلامي': 'reason_treasury',
  // Akdariyya reasons
  '½ = 9/27': 'reason_half_akdariyya',
  '⅓ = 6/27': 'reason_third_akdariyya',
  '⅙ ثم المقاسمة مع الأخت': 'reason_sixth_then_muqasamah_sister',
  '½ ثم المقاسمة مع الجد': 'reason_half_then_muqasamah_grandfather',
};

/**
 * Maps engine step type strings → i18n keys for title and description.
 */
const STEP_TITLE_MAP: Record<string, string> = {
  'المسألة المشتركة': 'step_musharraka_title',
  'المسألة المشتركة (الحمارية)': 'step_musharraka_title',
  'الأكدرية (الغراء)': 'step_akdariyya_title',
  'اختيار الأفضل للجد مع الإخوة': 'step_grandfather_optimal_title',
};

const STEP_DESC_MAP: Record<string, string> = {
  'الإخوة الأشقاء يشاركون الإخوة لأم في الثلث':
    'step_musharraka_desc',
  'مسألة الأكدرية - للجد مع الأخت طريقة خاصة':
    'step_akdariyya_desc',
  'تقليل الأنصباء بنسبة متساوية عند زيادة الفروض على التركة':
    'step_awl_desc',
  'توزيع الباقي على ذوي الأرحام': 'step_blood_relatives_desc',
  'لا يوجد ورثة - التركة لبيت المال': 'step_treasury_desc',
};

/**
 * Maps engine heir keys → i18n keys for heir names.
 * The engine uses `key` field (e.g., 'father', 'mother').
 */
const HEIR_NAME_KEY_MAP: Record<string, string> = {
  husband: 'heir_name_husband',
  wife: 'heir_name_wife',
  father: 'heir_name_father',
  mother: 'heir_name_mother',
  grandfather: 'heir_name_grandfather',
  grandmother_mother: 'heir_name_grandmother_maternal',
  grandmother_father: 'heir_name_grandmother_paternal',
  son: 'heir_name_son',
  daughter: 'heir_name_daughter',
  grandson: 'heir_name_grandson',
  granddaughter: 'heir_name_granddaughter',
  daughter_son: 'heir_name_daughter_son',
  daughter_daughter: 'heir_name_daughter_daughter',
  full_brother: 'heir_name_full_brother',
  full_sister: 'heir_name_full_sister',
  paternal_brother: 'heir_name_paternal_brother',
  paternal_sister: 'heir_name_paternal_sister',
  maternal_brother: 'heir_name_maternal_brother',
  maternal_sister: 'heir_name_maternal_sister',
  full_nephew: 'heir_name_full_nephew',
  paternal_nephew: 'heir_name_paternal_nephew',
  nephew_from_brother: 'heir_name_full_nephew',
  sister_children: 'heir_name_sister_children',
  full_uncle: 'heir_name_full_uncle',
  paternal_uncle: 'heir_name_paternal_uncle',
  maternal_uncle: 'heir_name_maternal_uncle',
  paternal_aunt: 'heir_name_paternal_aunt',
  maternal_aunt: 'heir_name_maternal_aunt',
  full_cousin: 'heir_name_full_cousin',
  paternal_cousin: 'heir_name_paternal_cousin',
  treasury: 'heir_name_treasury',
  shared_siblings: 'heir_name_shared_siblings',
};

/**
 * Returns a localized share type label.
 * Falls back to the raw Arabic string if no mapping exists.
 */
export function localizeShareType(arabicType: string): string {
  // Handle dynamic types like "فرض + رد"
  if (arabicType.includes(' + رد')) {
    const base = arabicType.replace(' + رد', '');
    const localizedBase = SHARE_TYPE_MAP[base]
      ? t(SHARE_TYPE_MAP[base])
      : base;
    return `${localizedBase} + ${t('share_type_radd')}`;
  }
  const key = SHARE_TYPE_MAP[arabicType];
  return key ? t(key) : arabicType;
}

/**
 * Returns a localized heir name using the share key.
 * Falls back to the engine-provided name.
 */
export function localizeHeirName(shareKey: string, fallbackName: string): string {
  const key = HEIR_NAME_KEY_MAP[shareKey];
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return fallbackName;
}

/**
 * Returns a localized reason text.
 * Falls back to the raw Arabic string if no mapping exists.
 */
export function localizeReason(arabicReason: string): string {
  const key = REASON_MAP[arabicReason];
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  // Handle dynamic distant asaba reason pattern
  const distantMatch = arabicReason.match(/^(.+) يرث الباقي$/);
  if (distantMatch) {
    return t('reason_heir_inherits_remainder', { heir: distantMatch[1] });
  }
  // Handle dynamic blood relatives pattern
  if (arabicReason.startsWith('من ذوي الأرحام')) {
    return t('reason_blood_relative_class');
  }
  return arabicReason;
}

/**
 * Returns a localized step title.
 */
export function localizeStepTitle(arabicTitle: string): string {
  const key = STEP_TITLE_MAP[arabicTitle];
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return arabicTitle;
}

/**
 * Returns a localized step description.
 */
export function localizeStepDesc(arabicDesc: string): string {
  const key = STEP_DESC_MAP[arabicDesc];
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return arabicDesc;
}

/**
 * Returns a localized heir name for the HeirSelector/HeirRow (by HeirType key).
 */
export function localizeHeirType(heirType: string): string {
  const key = HEIR_NAME_KEY_MAP[heirType];
  if (key) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }
  return heirType;
}
