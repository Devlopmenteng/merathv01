import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Column = {
  key: string;
  label: string;
  width: number;
};

type Props = {
  columns: Column[];
  data: Record<string, React.ReactNode>[];
  minWidth?: number;
};

export const DataTable: React.FC<Props> = ({ columns, data, minWidth }) => {
  const theme = useAppTheme();
  return (
    <ScrollView horizontal>
      <View style={{ minWidth: minWidth ?? '100%' }}>
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.outline, paddingBottom: 8, marginBottom: 8 }}>
          {columns.map(col => (
            <Text key={col.key} style={{ width: col.width, fontWeight: 'bold' }}>{col.label}</Text>
          ))}
        </View>
        {data.map((row, idx) => (
          <View key={idx} style={{ flexDirection: 'row', marginBottom: 8, paddingVertical: 4 }}>
            {columns.map(col => (
              <View key={col.key} style={{ width: col.width }}>
                {typeof row[col.key] === 'string' || typeof row[col.key] === 'number'
                  ? <Text>{row[col.key]}</Text>
                  : row[col.key]}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
