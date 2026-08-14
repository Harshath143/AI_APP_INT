import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CANDIDATE_ROLES, GROQ_MODELS } from '../types/chat';

interface Props {
  selectedModel: string;
  selectedRoleId: string;
  onSelectModel: (modelId: string) => void;
  onSelectRole: (roleId: string) => void;
}

export const ControlFooter: React.FC<Props> = React.memo(({
  selectedModel,
  selectedRoleId,
  onSelectModel,
  onSelectRole,
}) => {
  const currentModelLabel =
    GROQ_MODELS.find(m => m.id === selectedModel)?.id || selectedModel;
  const currentRoleLabel =
    CANDIDATE_ROLES.find(r => r.id === selectedRoleId)?.label || 'Python Dev';

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        {/* Model Selector */}
        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            const idx = GROQ_MODELS.findIndex(m => m.id === selectedModel);
            const nextIdx = (idx + 1) % GROQ_MODELS.length;
            onSelectModel(GROQ_MODELS[nextIdx].id);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.pillLabel}>MODEL:</Text>
          <Text style={styles.pillValue}>{currentModelLabel} ▾</Text>
        </TouchableOpacity>

        {/* Role Selector */}
        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            const idx = CANDIDATE_ROLES.findIndex(r => r.id === selectedRoleId);
            const nextIdx = (idx + 1) % CANDIDATE_ROLES.length;
            onSelectRole(CANDIDATE_ROLES[nextIdx].id);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.pillLabel}>ROLE:</Text>
          <Text style={styles.pillValue}>{currentRoleLabel} ▾</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  pillLabel: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pillValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});


