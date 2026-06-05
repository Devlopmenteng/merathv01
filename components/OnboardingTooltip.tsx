import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { t } from '../lib/i18n';
import { useAppTheme } from '../hooks/useAppTheme';

export const OnboardingTooltip = () => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.TOOLTIP_SEEN).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const dismiss = () => {
    AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.TOOLTIP_SEEN, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}>
      <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
        <Text style={theme.typography.body}>
          {t('tap_the_categories_to_add_family_members_use_the_steppers_to_set_their_count')}
        </Text>
        <TouchableOpacity
          accessibilityLabel="Button"
          onPress={dismiss}
          style={{ marginTop: 12, alignSelf: 'flex-end' }}
        >
          <Text style={{ color: theme.colors.primary }}>{t('got_it')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    bottom: 0,
    // backgroundColor set dynamically via theme.colors.backdrop
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  tooltip: {
    padding: 24,
    margin: 40,
    borderRadius: 12,
    elevation: 5,
  },
});
