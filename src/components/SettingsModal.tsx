import React, { useEffect, useState } from 'react';
import {
  Clipboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { validateApiKey } from '../services/groqService';
import { GROQ_MODELS, GROQ_VISION_MODELS } from '../types/chat';

interface Props {
  visible: boolean;
  apiKey: string;
  selectedModel: string;
  selectedVisionModel: string;
  customPrompt: string;
  onClose: () => void;
  onSave: (newKey: string, model: string, visionModel: string, customPrompt: string) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  visible,
  apiKey,
  selectedModel,
  selectedVisionModel,
  customPrompt,
  onClose,
  onSave,
  onClearHistory,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(selectedModel);
  const [visionModel, setVisionModel] = useState(selectedVisionModel);
  const [prompt, setPrompt] = useState(customPrompt);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setKeyInput(apiKey);
    setModel(selectedModel);
    setVisionModel(selectedVisionModel);
    setPrompt(customPrompt);
  }, [apiKey, selectedModel, selectedVisionModel, customPrompt, visible]);

  const handlePasteKey = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent) {
        setKeyInput(clipboardContent.trim());
      }
    } catch {
      // ignore clipboard error
    }
  };

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setTestStatus('❌ Please enter an API Key first.');
      return;
    }
    setIsTesting(true);
    setTestStatus('⚡ Testing connection to Groq API...');
    const isValid = await validateApiKey(keyInput);
    setIsTesting(false);
    if (isValid) {
      setTestStatus('✅ Groq API Key is valid and connected!');
    } else {
      setTestStatus('❌ Invalid Groq API Key. Check key at console.groq.com');
    }
  };

  const handleSave = () => {
    onSave(keyInput.trim(), model, visionModel, prompt);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚙ Interview AI Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Groq API Key Section */}
            <View style={styles.section}>
              <Text style={styles.label}>🔑 Groq API Key</Text>
              <Text style={styles.sublabel}>
                Enter or paste your Groq API key (starts with gsk_). Stored locally on device.
              </Text>

              {/* Full-width Touch-enabled Text Input */}
              <TextInput
                style={styles.keyInputFull}
                value={keyInput}
                onChangeText={text => setKeyInput(text)}
                placeholder="gsk_..."
                placeholderTextColor="#71717a"
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
                editable={true}
                selectTextOnFocus={true}
              />

              {/* Key Action Buttons */}
              <View style={styles.keyActionsRow}>
                <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteKey} activeOpacity={0.7}>
                  <Text style={styles.pasteText}>📋 Paste from Clipboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(!showKey)} activeOpacity={0.7}>
                  <Text style={styles.eyeText}>{showKey ? '🔒 Hide' : '👁 Show'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.clearKeyBtn} onPress={() => setKeyInput('')} activeOpacity={0.7}>
                  <Text style={styles.clearKeyText}>Clear</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestKey}
                disabled={isTesting}
                activeOpacity={0.7}
              >
                <Text style={styles.testBtnText}>
                  {isTesting ? 'Testing...' : '⚡ Test Connection'}
                </Text>
              </TouchableOpacity>
              {testStatus ? <Text style={styles.statusText}>{testStatus}</Text> : null}
            </View>

            {/* Chat Model Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>🤖 Streaming AI Model</Text>
              <View style={styles.optionsGrid}>
                {GROQ_MODELS.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.optionChip,
                      model === m.id && styles.optionChipActive,
                    ]}
                    onPress={() => setModel(m.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        model === m.id && styles.chipTextActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vision Model Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>📸 Vision / Screen Analysis Model</Text>
              <View style={styles.optionsGrid}>
                {GROQ_VISION_MODELS.map(vm => (
                  <TouchableOpacity
                    key={vm.id}
                    style={[
                      styles.optionChip,
                      visionModel === vm.id && styles.optionChipActive,
                    ]}
                    onPress={() => setVisionModel(vm.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        visionModel === vm.id && styles.chipTextActive,
                      ]}
                    >
                      {vm.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* System Prompt Customization */}
            <View style={styles.section}>
              <Text style={styles.label}>🎭 Custom System Context / Prompt</Text>
              <TextInput
                style={styles.promptInput}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Custom interviewer role context..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Clear History */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.clearHistoryBtn}
                onPress={onClearHistory}
              >
                <Text style={styles.clearHistoryText}>
                  🗑 Clear All Saved Chat History
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#09090b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    height: '80%',
    maxHeight: '85%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
    backgroundColor: '#000000',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#71717a',
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sublabel: {
    color: '#71717a',
    fontSize: 11,
  },
  keyInputFull: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
    width: '100%',
    marginVertical: 4,
  },
  keyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pasteBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pasteText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  clearKeyBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  clearKeyText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '600',
  },
  eyeBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  eyeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  testBtn: {
    backgroundColor: '#18181b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
    marginTop: 4,
  },
  testBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    backgroundColor: '#18181b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  optionChipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  chipText: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  promptInput: {
    backgroundColor: '#18181b',
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
    minHeight: 60,
  },
  clearHistoryBtn: {
    backgroundColor: '#450a0a',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  clearHistoryText: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#18181b',
    backgroundColor: '#000000',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
