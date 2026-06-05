import { t } from '../i18n';

export function getFiqhNotes(): Record<string, Record<string, string>> {
  return {
    hanafi: {
      grandfather_with_siblings: t('fiqh_hanafi_grandfather'),
      mother_with_father_children: t('fiqh_hanafi_mother'),
      spouse_radd: t('fiqh_hanafi_radd'),
    },
    maliki: {
      grandfather_with_siblings: t('fiqh_maliki_grandfather'),
      mother_with_father_children: t('fiqh_maliki_mother'),
      spouse_radd: t('fiqh_maliki_radd'),
    },
    shafii: {
      grandfather_with_siblings: t('fiqh_shafii_grandfather'),
      mother_with_father_children: t('fiqh_shafii_mother'),
      spouse_radd: t('fiqh_shafii_radd'),
    },
    hanbali: {
      grandfather_with_siblings: t('fiqh_hanbali_grandfather'),
      mother_with_father_children: t('fiqh_hanbali_mother'),
      spouse_radd: t('fiqh_hanbali_radd'),
    },
  };
}

/** @deprecated Use getFiqhNotes() for localized strings */
export const FIQH_NOTES = getFiqhNotes();
