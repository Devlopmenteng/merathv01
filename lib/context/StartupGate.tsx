import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initI18n } from '../i18n';

const StartupGate = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
      } catch {
        // Proceed with default locale on i18n init failure
      }
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <>{children}</>;
};

export default StartupGate;
