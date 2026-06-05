import React from 'react';

/**
 * StartupGate — renders children directly.
 * i18n initialization is handled by LanguageContext with the correct stored locale.
 */
const StartupGate = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default StartupGate;
