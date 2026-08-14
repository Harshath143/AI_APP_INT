import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  isRecording: boolean;
  recordingTime: string;
  isCollapsed: boolean;
  onToggleRecord: () => void;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const InterviewHeader: React.FC<Props> = ({
  isRecording,
  recordingTime,
  isCollapsed,
  onToggleRecord,
  onToggleCollapse,
  onOpenSettings,
  hasApiKey,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Text style={styles.appTitle}>🎙 Interview AI</Text>
        <TouchableOpacity
          style={styles.hideBadge}
          onPress={onToggleCollapse}
          activeOpacity={0.7}
        >
          <Text style={styles.hideText}>
            {isCollapsed ? '👁 Show' : '🙈 Hide'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightRow}>
        <View style={styles.timerBadge}>
          <View
            style={[
              styles.statusDot,
              isRecording ? styles.dotRecording : styles.dotIdle,
            ]}
          />
          <Text style={styles.timerText}>{recordingTime}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.recordBtn,
            isRecording ? styles.recordBtnActive : styles.recordBtnIdle,
          ]}
          onPress={onToggleRecord}
          activeOpacity={0.8}
        >
          <Text style={styles.recordBtnText}>
            {isRecording ? '⏹ Stop' : '▶ Record'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsBtn, !hasApiKey && styles.settingsBtnWarning]}
          onPress={onOpenSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
          {!hasApiKey && <View style={styles.keyAlertDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hideBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hideText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotIdle: {
    backgroundColor: '#64748b',
  },
  dotRecording: {
    backgroundColor: '#ef4444',
  },
  timerText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  recordBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  recordBtnIdle: {
    backgroundColor: '#2563eb',
  },
  recordBtnActive: {
    backgroundColor: '#dc2626',
  },
  recordBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsBtnWarning: {
    borderColor: '#f59e0b',
  },
  settingsIcon: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  keyAlertDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
});
