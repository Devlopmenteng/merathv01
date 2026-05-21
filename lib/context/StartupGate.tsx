import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initI18n } from '../i18n';

const StartupGate = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initI18n();
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
