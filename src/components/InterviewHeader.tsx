import React from 'react';
import {
  Platform,
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

export const InterviewHeader: React.FC<Props> = React.memo(({
  isRecording,
  recordingTime,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
  hasApiKey,
}) => {
  return (
    <View style={styles.container}>
      {/* Left: Minimal MH Logo & App Title */}
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>MH</Text>
        </View>
        <Text style={styles.titleText}>INTERVIEW <Text style={styles.titleBold}>AI</Text></Text>
      </View>

      {/* Right: Recording Badge, Settings & Hide Toggle */}
      <View style={styles.rightRow}>
        {isRecording && (
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recTime}>{recordingTime}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.iconBtn, !hasApiKey && styles.iconBtnWarning]}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>⚙</Text>
          {!hasApiKey && <View style={styles.warningDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hideBtn}
          onPress={onToggleCollapse}
          activeOpacity={0.7}
        >
          <Text style={styles.hideText}>{isCollapsed ? 'SHOW' : 'HIDE'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    minWidth: 36,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  titleText: {
    color: '#71717a',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif-medium',
  },
  titleBold: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  recTime: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnWarning: {
    borderColor: '#f59e0b',
  },
  iconText: {
    color: '#e4e4e7',
    fontSize: 14,
  },
  warningDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },
  hideBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  hideText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});



