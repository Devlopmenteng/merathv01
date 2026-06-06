import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number;
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeight = 0.85,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              maxHeight: maxHeight,
              paddingBottom: insets.bottom + theme.spacing.md,
              ...theme.elevation.large,
            },
          ]}
        >
          <Pressable onPress={() => {}} style={styles.content}>
            <View style={styles.handleBar} />
            {title && (
              <View style={styles.header}>
                <Text style={[theme.typography.h3, { flex: 1 }]}>{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={[styles.closeButton, { color: theme.colors.primary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <ScrollView>{children}</ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4B9A8',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
    paddingStart: 16,
  },
});
