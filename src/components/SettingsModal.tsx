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

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Groq API Key Section */}
            <View style={styles.section}>
              <Text style={styles.label}>🔑 Groq API Key</Text>
              <Text style={styles.sublabel}>
                Paste your Groq API key (starts with gsk_). Stored locally only.
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.keyInput}
                  value={keyInput}
                  onChangeText={setKeyInput}
                  placeholder="gsk_..."
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteKey}>
                  <Text style={styles.pasteText}>📋 Paste</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearKeyBtn} onPress={() => setKeyInput('')}>
                  <Text style={styles.clearKeyText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowKey(!showKey)}
                >
                  <Text style={styles.eyeText}>{showKey ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestKey}
                disabled={isTesting}
              >
                <Text style={styles.testBtnText}>
                  {isTesting ? 'Testing...' : '⚡ Test Groq API Key'}
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
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
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
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#94a3b8',
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
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  sublabel: {
    color: '#64748b',
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pasteBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pasteText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  clearKeyBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearKeyText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  eyeBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  eyeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  testBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284c7',
    marginTop: 4,
  },
  testBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  promptInput: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 60,
  },
  clearHistoryBtn: {
    backgroundColor: '#450a0a',
    paddingVertical: 8,
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
    borderTopColor: '#1e293b',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
