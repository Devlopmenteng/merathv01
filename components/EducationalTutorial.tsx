import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../hooks/useAppTheme';
import { APP_DEFAULTS } from '../lib/constants/appDefaults';
import { t } from '../lib/i18n';

const slides = [
  { titleKey: 'tutorial_welcome_title', contentKey: 'tutorial_welcome_content' },
  { titleKey: 'tutorial_step1_title', contentKey: 'tutorial_step1_content' },
  { titleKey: 'tutorial_step2_title', contentKey: 'tutorial_step2_content' },
  { titleKey: 'tutorial_step3_title', contentKey: 'tutorial_step3_content' },
  { titleKey: 'tutorial_step4_title', contentKey: 'tutorial_step4_content' },
];

const { width } = Dimensions.get('window');

export const EducationalTutorial = () => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(APP_DEFAULTS.STORAGE_KEYS.TUTORIAL_SEEN).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      AsyncStorage.setItem(APP_DEFAULTS.STORAGE_KEYS.TUTORIAL_SEEN, 'true');
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <Text style={[theme.typography.h2, { textAlign: 'center', marginBottom: 16 }]}>
            {t(slides[step].titleKey)}
          </Text>
          <Text style={[theme.typography.body, { textAlign: 'center', marginBottom: 24 }]}>
            {t(slides[step].contentKey)}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={{ color: theme.colors.error }}>{t('skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={next}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {step === slides.length - 1 ? t('finish') : t('next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor set dynamically via theme.colors.backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { width: width * 0.8, padding: 24, borderRadius: 16, alignItems: 'center' },
});
