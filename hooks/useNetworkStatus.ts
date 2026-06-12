import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    type: null,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Temporarily return always online until netinfo is installed
    setStatus({
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    });
  }, []);

  return status;
};
