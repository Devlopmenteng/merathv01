import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as MailComposer from 'expo-mail-composer';
import { showConfirm } from '../lib/utils/alerts';

export const FeedbackButton = () => {
  const handlePress = async () => {
    const can = await StoreReview.hasAction();
    if (can) {
      StoreReview.requestReview();
    } else {
      showConfirm('feedback_title', 'feedback_prompt', () => {
        MailComposer.composeAsync({ recipients: ['support@merath.app'], subject: 'Merath Feedback' });
      });
    }
  };

  return (
    <TouchableOpacity accessibilityLabel="Button" onPress={handlePress} style={{ padding: 12, backgroundColor: '#C5A04E', borderRadius: 8, marginVertical: 8 }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>⭐ Rate Us / Send Feedback</Text>
    </TouchableOpacity>
  );
};
