import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { t } from '../lib/i18n';
import { HeirEntry, HeirType } from '../lib/engine/types';

type Template = {
  name: string;
  heirs: HeirEntry[];
};

const TEMPLATES: Template[] = [
  {
    name: 'Nuclear Family',
    heirs: [
      { type: 'husband' as HeirType, count: 1 },
      { type: 'wife' as HeirType, count: 1 },
      { type: 'son' as HeirType, count: 2 },
      { type: 'daughter' as HeirType, count: 2 },
    ],
  },
  {
    name: 'Parents + 1 Son',
    heirs: [
      { type: 'father' as HeirType, count: 1 },
      { type: 'mother' as HeirType, count: 1 },
      { type: 'son' as HeirType, count: 1 },
    ],
  },
  {
    name: 'Husband + 1 Daughter',
    heirs: [
      { type: 'husband' as HeirType, count: 1 },
      { type: 'daughter' as HeirType, count: 1 },
    ],
  },
  {
    name: 'Wife + Parents',
    heirs: [
      { type: 'wife' as HeirType, count: 1 },
      { type: 'father' as HeirType, count: 1 },
      { type: 'mother' as HeirType, count: 1 },
    ],
  },
];

interface TemplatesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (heirs: HeirEntry[]) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <Text style={[theme.typography.h2, { marginBottom: 16 }]}>{t('quick_templates')}</Text>
          <FlatList
            data={TEMPLATES}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.templateItem, { borderBottomColor: theme.colors.outline }]}
                onPress={() => {
                  onSelectTemplate(item.heirs);
                  onClose();
                }}
              >
                <Text style={theme.typography.body}>{item.name}</Text>
                <Text style={{ color: theme.colors.primary }}>→</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={{ color: theme.colors.onPrimary }}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor set dynamically via theme.colors.backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
