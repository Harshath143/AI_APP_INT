import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  inputText: string;
  onChangeInputText: (text: string) => void;
  onSendAnswer: () => void;
  onTranscribeAndAnswer: () => void;
  onPickScreenAnalysis: () => void;
  onClear: () => void;
  onOpenSettings: () => void;
  isRecording: boolean;
  onToggleRecord: () => void;
  isGenerating: boolean;
  isTranscribing: boolean;
  hasApiKey: boolean;
}

export const ActionToolbar: React.FC<Props> = React.memo(({
  inputText,
  onChangeInputText,
  onSendAnswer,
  onTranscribeAndAnswer,
  onPickScreenAnalysis,
  onClear,
  isRecording,
  onToggleRecord,
  isGenerating,
  isTranscribing,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Action Pills */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.pillBtn, isRecording ? styles.pillRecActive : styles.pillDark]}
          onPress={onToggleRecord}
          activeOpacity={0.8}
        >
          <Text style={styles.pillText}>
            {isRecording ? '⏹ STOP' : '🎙 RECORD'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillBtn, styles.pillDark]}
          onPress={onTranscribeAndAnswer}
          disabled={isTranscribing || isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.pillText}>
            {isTranscribing ? '⏳ WHISPER...' : '🔍 TRANSCRIBE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillBtn, styles.pillDark]}
          onPress={onPickScreenAnalysis}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.pillText}>📸 VISION</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Minimal Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          value={inputText}
          onChangeText={onChangeInputText}
          placeholder="Type or transcribe question..."
          placeholderTextColor="#52525b"
          multiline={false}
          maxLength={1000}
          editable={!isGenerating && !isTranscribing}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (inputText.trim() && !isGenerating) {
              onSendAnswer();
            }
          }}
          enablesReturnKeyAutomatically={true}
        />

        <View style={styles.inputActions}>
          <TouchableOpacity
            style={styles.addCodeBtn}
            onPress={() => {
              onChangeInputText(
                inputText
                  ? `${inputText}\n\`\`\`\n\n\`\`\``
                  : '```\n// Add your code snippet here\n```'
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.addCodeText}>+ CODE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isGenerating) && styles.sendBtnDisabled,
            ]}
            onPress={() => onSendAnswer()}
            disabled={!inputText.trim() || isGenerating}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  pillRecActive: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  pillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'sans-serif-medium',
  },
  clearBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputField: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCodeBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  addCodeText: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#27272a',
  },
  sendIcon: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
  },
});


