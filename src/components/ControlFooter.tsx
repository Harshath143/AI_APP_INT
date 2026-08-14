import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AudioSourceMode, CANDIDATE_ROLES, GROQ_MODELS } from '../types/chat';

interface Props {
  selectedModel: string;
  selectedRoleId: string;
  audioMode: AudioSourceMode;
  opacity: number;
  onSelectModel: (modelId: string) => void;
  onSelectRole: (roleId: string) => void;
  onToggleAudioMode: () => void;
  onChangeOpacity: (newOpacity: number) => void;
}

export const ControlFooter: React.FC<Props> = ({
  selectedModel,
  selectedRoleId,
  audioMode,
  opacity,
  onSelectModel,
  onSelectRole,
  onToggleAudioMode,
  onChangeOpacity,
}) => {
  const currentModelLabel =
    GROQ_MODELS.find(m => m.id === selectedModel)?.id || selectedModel;
  const currentRoleLabel =
    CANDIDATE_ROLES.find(r => r.id === selectedRoleId)?.label || 'General';

  const audioModeLabel =
    audioMode === 'mic' ? '🎤 Mic' : audioMode === 'system' ? '🔊 System' : '⊕ Both';

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            const idx = GROQ_MODELS.findIndex(m => m.id === selectedModel);
            const nextIdx = (idx + 1) % GROQ_MODELS.length;
            onSelectModel(GROQ_MODELS[nextIdx].id);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.pillLabel}>Model:</Text>
          <Text style={styles.pillValue}>{currentModelLabel} ▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            const idx = CANDIDATE_ROLES.findIndex(r => r.id === selectedRoleId);
            const nextIdx = (idx + 1) % CANDIDATE_ROLES.length;
            onSelectRole(CANDIDATE_ROLES[nextIdx].id);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.pillLabel}>Role:</Text>
          <Text style={styles.pillValue}>{currentRoleLabel} ▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillBtn}
          onPress={onToggleAudioMode}
          activeOpacity={0.7}
        >
          <Text style={styles.pillLabel}>Audio:</Text>
          <Text style={styles.pillValue}>{audioModeLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => {
            const nextOpacity = opacity >= 0.95 ? 0.4 : opacity >= 0.7 ? 0.95 : 0.7;
            onChangeOpacity(nextOpacity);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.pillLabel}>Opacity:</Text>
          <Text style={styles.pillValue}>
            {Math.round(opacity * 100)}%
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  pillLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  pillValue: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
});
