import React from 'react';
import { View, Text, ScrollView, I18nManager } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { Card } from '../components/ui/Card';
import { FIQH_NOTES } from '../lib/services/FiqhReferences';
import { MADHAB_NAMES } from '../lib/engine/constants';
import { t } from '../lib/i18n';

const FIXED_SHARES = [
  { shareKey: 'share_half', heirsKey: 'heirs_half' },
  { shareKey: 'share_quarter', heirsKey: 'heirs_quarter' },
  { shareKey: 'share_eighth', heirsKey: 'heirs_eighth' },
  { shareKey: 'share_two_thirds', heirsKey: 'heirs_two_thirds' },
  { shareKey: 'share_third', heirsKey: 'heirs_third' },
  { shareKey: 'share_sixth', heirsKey: 'heirs_sixth' },
];

const HIJAB_RULES = [
  {
    blockedKey: 'hijab_grandfather',
    blockerKey: 'hijab_father',
    typeKey: 'hijab_type_deprivation',
  },
  {
    blockedKey: 'hijab_grandmother_father',
    blockerKey: 'hijab_mother_or_father',
    typeKey: 'hijab_type_deprivation',
  },
  {
    blockedKey: 'hijab_grandmother_mother',
    blockerKey: 'hijab_mother',
    typeKey: 'hijab_type_deprivation',
  },
  { blockedKey: 'hijab_grandson', blockerKey: 'hijab_son', typeKey: 'hijab_type_deprivation' },
  {
    blockedKey: 'hijab_granddaughter',
    blockerKey: 'hijab_son_or_two_daughters',
    typeKey: 'hijab_type_deprivation',
  },
  {
    blockedKey: 'hijab_full_siblings',
    blockerKey: 'hijab_son_grandson_father',
    typeKey: 'hijab_type_deprivation',
  },
  {
    blockedKey: 'hijab_paternal_siblings',
    blockerKey: 'hijab_full_sibling',
    typeKey: 'hijab_type_deprivation',
  },
  {
    blockedKey: 'hijab_maternal_siblings',
    blockerKey: 'hijab_descendant_or_male_ascendant',
    typeKey: 'hijab_type_deprivation',
  },
  {
    blockedKey: 'hijab_paternal_sister',
    blockerKey: 'hijab_two_full_sisters',
    typeKey: 'hijab_type_deprivation',
  },
];

const SPECIAL_CASES = [
  { nameKey: 'special_umariyyah', descKey: 'special_umariyyah_desc' },
  { nameKey: 'special_awl', descKey: 'special_awl_desc' },
  { nameKey: 'special_radd', descKey: 'special_radd_desc' },
  { nameKey: 'special_musharraka', descKey: 'special_musharraka_desc' },
  { nameKey: 'special_akdariyya', descKey: 'special_akdariyya_desc' },
  { nameKey: 'special_asaba_with_ghayr', descKey: 'special_asaba_with_ghayr_desc' },
];

export const FiqhRules = () => {
  const theme = useAppTheme();

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
      <Text
        style={[
          theme.typography.h2,
          { marginBottom: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
        ]}
      >
        {t('madhab_notes')}
      </Text>
      {Object.entries(FIQH_NOTES).map(([madhab, notes]) => (
        <Card key={madhab} variant="outlined" leftBorder={theme.colors.primary}>
          <Text
            style={[
              theme.typography.h3,
              {
                color: theme.colors.primary,
                marginBottom: 4,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {MADHAB_NAMES[madhab as keyof typeof MADHAB_NAMES] || madhab}
          </Text>
          {Object.entries(notes).map(([key, val]) => (
            <Text
              key={key}
              style={[
                theme.typography.caption,
                { marginTop: 4, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
              ]}
            >
              • {val as string}
            </Text>
          ))}
        </Card>
      ))}

      <Text
        style={[
          theme.typography.h2,
          { marginVertical: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
        ]}
      >
        {t('special_cases_title')}
      </Text>
      {SPECIAL_CASES.map((caseItem) => (
        <Card key={caseItem.nameKey} variant="filled">
          <Text
            style={[
              theme.typography.h3,
              {
                color: theme.colors.secondary,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              },
            ]}
          >
            {t(caseItem.nameKey)}
          </Text>
          <Text
            style={[theme.typography.body, { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}
          >
            {t(caseItem.descKey)}
          </Text>
        </Card>
      ))}

      <Text
        style={[
          theme.typography.h2,
          { marginVertical: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
        ]}
      >
        {t('fixed_shares_title')}
      </Text>
      <ScrollView
        horizontal
        contentContainerStyle={{
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        }}
      >
        <View style={{ minWidth: 300 }}>
          <View
            style={{
              flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
              borderBottomWidth: 1,
              borderColor: theme.colors.outline,
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={[
                {
                  flex: 1,
                  fontWeight: 'bold',
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('share')}
            </Text>
            <Text
              style={[
                {
                  flex: 2,
                  fontWeight: 'bold',
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('heirs')}
            </Text>
          </View>
          {FIXED_SHARES.map((item) => (
            <View
              key={item.shareKey}
              style={{
                flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                marginBottom: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={[{ flex: 1, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
                {t(item.shareKey)}
              </Text>
              <Text style={[{ flex: 2, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
                {t(item.heirsKey)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Text
        style={[
          theme.typography.h2,
          { marginVertical: theme.spacing.md, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
        ]}
      >
        {t('hijab_rules_title')}
      </Text>
      <ScrollView
        horizontal
        contentContainerStyle={{
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        }}
      >
        <View style={{ minWidth: 340 }}>
          <View
            style={{
              flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
              borderBottomWidth: 1,
              borderColor: theme.colors.outline,
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={[
                {
                  flex: 1,
                  fontWeight: 'bold',
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('blocked')}
            </Text>
            <Text
              style={[
                {
                  flex: 1,
                  fontWeight: 'bold',
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('blocker')}
            </Text>
            <Text
              style={[
                {
                  flex: 1,
                  fontWeight: 'bold',
                  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                },
              ]}
            >
              {t('hijab_type')}
            </Text>
          </View>
          {HIJAB_RULES.map((item) => (
            <View
              key={item.blockedKey}
              style={{
                flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                marginBottom: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={[{ flex: 1, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
                {t(item.blockedKey)}
              </Text>
              <Text style={[{ flex: 1, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
                {t(item.blockerKey)}
              </Text>
              <Text style={[{ flex: 1, writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' }]}>
                {t(item.typeKey)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};
