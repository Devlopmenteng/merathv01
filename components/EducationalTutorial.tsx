import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useDismissableFlag } from '../hooks/useDismissableFlag';

const slides = [
  { title: 'مرحباً بك في ميراث', content: 'تطبيق متخصص لحساب المواريث الشرعية وفق المذاهب الأربعة.' },
  { title: 'الخطوة 1: أدخل التركة', content: 'أدخل إجمالي التركة، تكاليف التجهيز، الديون، والوصية (الحد الأقصى ثلث الباقي).' },
  { title: 'الخطوة 2: اختر المذهب', content: 'اختر المذهب الفقهي الذي تتبعه (حنفي، مالكي، شافعي، حنبلي).' },
  { title: 'الخطوة 3: حدد الورثة', content: 'أضف الورثة وحدد أعدادهم. سيتم تطبيق الحجب تلقائياً.' },
  { title: 'النتائج والمشاركة', content: 'اطلع على التوزيع المفصل، قارن بين المذاهب، وشارك التقرير القانوني.' },
];

const { width } = Dimensions.get('window');

export const EducationalTutorial = () => {
  const theme = useAppTheme();
  const { visible, dismiss } = useDismissableFlag('merath_tutorial_seen');
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <Text style={[theme.typography.h2, { textAlign: 'center', marginBottom: 16 }]}>{slides[step].title}</Text>
          <Text style={[theme.typography.body, { textAlign: 'center', marginBottom: 24 }]}>{slides[step].content}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity accessibilityLabel="Button" onPress={dismiss}>
              <Text style={{ color: theme.colors.error }}>تخطي</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Button" onPress={next}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {step === slides.length - 1 ? 'إنهاء' : 'التالي'}
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
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  container: {
    width: width * 0.8, padding: 24, borderRadius: 16, alignItems: 'center',
  },
});
