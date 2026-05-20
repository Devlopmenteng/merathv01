import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, Share, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useAppTheme } from '../hooks/useAppTheme';
import type { CalculationResult } from '../lib/engine/types';

type ExportBarProps = {
  resultData: CalculationResult;
  children: React.ReactNode;
};

export const ExportBar: React.FC<ExportBarProps> = ({ resultData, children }) => {
  const viewShotRef = useRef<any>(null);
  const theme = useAppTheme();

  const generatePDF = async () => {
    const html = `
      <h1>Inheritance Report</h1>
      <p>Net Estate: $${resultData.netEstate ?? resultData.netEstate ?? 0}</p>
      <ul>${resultData.shares
        .map((s) => `<li>${s.name}: $${s.amount.toFixed(2)}</li>`)
        .join('')}</ul>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'web') window.open(uri);
    else await Sharing.shareAsync(uri);
  };

  const captureAndShare = async () => {
    const uri = await viewShotRef.current.capture();
    await Share.share({ message: 'Inheritance Report', url: uri });
  };

  return (
    <View>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
        {children}
      </ViewShot>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
        <TouchableOpacity
          onPress={generatePDF}
          style={{ padding: 12, backgroundColor: theme.colors.primary, borderRadius: 8 }}
        >
          <Text style={{ color: theme.colors.onPrimary }}>PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={captureAndShare}
          style={{ padding: 12, backgroundColor: theme.colors.secondary, borderRadius: 8 }}
        >
          <Text style={{ color: theme.colors.onSecondary }}>Share Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
