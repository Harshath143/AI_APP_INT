import React from 'react';
import {
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
  isGenerating: boolean;
  isTranscribing: boolean;
}

export const ActionToolbar: React.FC<Props> = ({
  inputText,
  onChangeInputText,
  onSendAnswer,
  onTranscribeAndAnswer,
  onPickScreenAnalysis,
  onClear,
  isGenerating,
  isTranscribing,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.btnAi]}
          onPress={onSendAnswer}
          disabled={isGenerating || !inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>💡 AI Answer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnAnalyse]}
          onPress={onTranscribeAndAnswer}
          disabled={isTranscribing || isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {isTranscribing ? '⏳ Whisper...' : '🔍 Analyse Audio'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnScreen]}
          onPress={onPickScreenAnalysis}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>📸 Screen Vision</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Text style={styles.clearText}>🗑 Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={onChangeInputText}
          placeholder="Type or transcribe question..."
          placeholderTextColor="#64748b"
          multiline
          maxLength={1000}
          editable={!isGenerating && !isTranscribing}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!inputText.trim() || isGenerating) && styles.sendBtnDisabled,
          ]}
          onPress={onSendAnswer}
          disabled={!inputText.trim() || isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.sendText}>Send ➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    padding: 10,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnAi: {
    backgroundColor: '#0369a1',
    borderColor: '#0284c7',
  },
  btnAnalyse: {
    backgroundColor: '#4c1d95',
    borderColor: '#6d28d9',
  },
  btnScreen: {
    backgroundColor: '#047857',
    borderColor: '#059669',
  },
  btnText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '700',
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 'auto',
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 70,
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#334155',
  },
  sendText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
