import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDismissableFlag(storageKey: string) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(val => {
      if (!val) setVisible(true);
    });
  }, [storageKey]);

  const dismiss = () => {
    AsyncStorage.setItem(storageKey, 'true');
    setVisible(false);
  };

  return { visible, dismiss };
}
