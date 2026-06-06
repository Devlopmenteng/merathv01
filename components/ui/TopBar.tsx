import React from 'react';
import { View, Text, TouchableOpacity, I18nManager, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';

type TopBarProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
};

export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack,
  onBack,
  rightAction,
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.side}>
        {showBack && onBack && (
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Back"
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              }}
            >
              {'\u2190'} Back
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[theme.typography.h2, styles.title]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.side}>{rightAction || null}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 80,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
});
