import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useReducedMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => listener.remove();
  }, []);

  return reduceMotion;
};
