import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as MailComposer from 'expo-mail-composer';
import { showConfirm } from '../lib/utils/alerts';
import { t } from '../lib/i18n';
import { useAppTheme } from '../hooks/useAppTheme';

export const FeedbackButton = () => {
  const theme = useAppTheme();

  const handlePress = async () => {
    const can = await StoreReview.hasAction();
    if (can) {
      StoreReview.requestReview();
    } else {
      showConfirm('feedback_title', 'feedback_prompt', () => {
        MailComposer.composeAsync({
          recipients: ['support@merath.app'],
          subject: t('feedback_subject'),
        });
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        padding: theme.spacing.md,
        backgroundColor: theme.colors.secondary,

        marginVertical: theme.spacing.sm,
      }}
    >
      <Text style={{ color: theme.colors.onSecondary, textAlign: 'center' }}>
        {t('rate_us_send_feedback')}
      </Text>
    </TouchableOpacity>
  );
};
