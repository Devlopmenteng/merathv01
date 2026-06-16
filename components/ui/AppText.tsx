import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { fonts } from '../../lib/constants/theme';
import { useLanguage } from '../../lib/context/LanguageContext';

type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'labelSmall'
  | 'mono'
  | 'monoSmall'
  | 'button'
  | 'overline';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

const RTL_LOCALES = ['ar', 'ur'];

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color,
  style,
  children,
  ...props
}) => {
  const theme = useAppTheme();
  const { locale } = useLanguage();

  const isRTL = RTL_LOCALES.includes(locale);
  const fontSet = isRTL ? fonts.arabic : fonts.latin;

  const token = theme.typography[variant];
  const fontWeight = token.fontWeight;

  const weightMap: Record<string, '400' | '500' | '600' | '700'> = {
    '400': '400',
    '500': '500',
    '600': '600',
    '700': '700',
  };

  const fontFamily = fontSet[weightMap[fontWeight] || '400'];

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: token.fontSize,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight,
          letterSpacing: 'letterSpacing' in token ? (token as { letterSpacing?: number }).letterSpacing : undefined,
          color: color || theme.colors.text.primary,
          textTransform: 'textTransform' in token ? (token as { textTransform?: 'uppercase' }).textTransform : undefined,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
