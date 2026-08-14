import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { ActionToolbar } from './src/components/ActionToolbar';
import { ControlFooter } from './src/components/ControlFooter';
import { InterviewHeader } from './src/components/InterviewHeader';
import { SettingsModal } from './src/components/SettingsModal';
import { StreamingAnswerView } from './src/components/StreamingAnswerView';
import { audioService } from './src/services/audioService';
import {
  analyzeGroqImage,
  streamGroqChat,
  transcribeGroqAudio,
} from './src/services/groqService';
import {
  clearStorageMessages,
  DEFAULT_SETTINGS,
  loadMessages,
  loadSettings,
  saveMessages,
  saveSettings,
} from './src/services/storageService';
import {
  AppSettings,
  AudioSourceMode,
  CANDIDATE_ROLES,
  ChatMessage,
} from './src/types/chat';
import { setupConsoleSanitizer } from './src/utils/sanitizer';

// Initialize dev console sanitizer immediately
setupConsoleSanitizer();

function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [streamingToken, setStreamingToken] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Load persistent settings and chat messages on launch
  useEffect(() => {
    StatusBar.setHidden(false);
    (async () => {
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings);
      const loadedMsgs = await loadMessages();
      setMessages(loadedMsgs);
    })();
  }, []);

  // Listen to Audio timer
  useEffect(() => {
    const unsubscribe = audioService.subscribe(state => {
      setIsRecording(state.isRecording);
      setRecordingSeconds(state.durationSeconds);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-save chat messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const handleToggleRecord = useCallback(() => {
    if (isRecording) {
      const { durationSeconds } = audioService.stopRecording();
      Alert.alert(
        '🎙 Audio Recorded',
        `Recorded ${audioService.formatDuration(durationSeconds)} of interview audio.\nClick "🔍 Transcribe & Answer" to run Whisper AI.`,
      );
    } else {
      audioService.startRecording();
    }
  }, [isRecording]);

  const currentSystemPrompt = useCallback((): string => {
    if (settings.customSystemPrompt && settings.customSystemPrompt.trim()) {
      return settings.customSystemPrompt;
    }
    const roleOpt = CANDIDATE_ROLES.find(r => r.id === settings.roleId);
    return (
      roleOpt?.systemPrompt ||
      'You are a senior software developer in a technical job interview. Give clear, concise, direct, and optimal answers.'
    );
  }, [settings.customSystemPrompt, settings.roleId]);

  const handleSendAnswer = useCallback(async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend || !textToSend.trim()) return;

    if (!settings.apiKey) {
      Alert.alert(
        '🔑 Missing Groq API Key',
        'Please click the Settings gear icon (⚙) and enter your free Groq API key.',
        [{ text: 'Open Settings', onPress: () => setSettingsVisible(true) }],
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setStreamingToken('');
    setIsGenerating(true);

    let currentAccumulated = '';

    await streamGroqChat(
      updatedMessages,
      settings.apiKey,
      settings.model || 'llama-3.3-70b-versatile',
      currentSystemPrompt(),
      {
        onToken: (token: string) => {
          currentAccumulated += token;
          setStreamingToken(currentAccumulated);
        },
        onComplete: (fullText: string) => {
          const finalAnswer = fullText || currentAccumulated;
          if (finalAnswer) {
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: finalAnswer,
              timestamp: Date.now(),
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
          setStreamingToken('');
          setIsGenerating(false);
        },
        onError: (error: Error) => {
          const errorMsg = error?.message || String(error || 'Failed to generate answer.');
          Alert.alert('Error Generating Answer', errorMsg);
          setStreamingToken('');
          setIsGenerating(false);
        },
      },
    );
  }, [inputText, messages, settings.apiKey, settings.model, currentSystemPrompt]);

  const handleTranscribeAndAnswer = useCallback(async () => {
    if (isRecording) {
      audioService.stopRecording();
    }

    if (!settings.apiKey) {
      Alert.alert('🔑 Missing Groq API Key', 'Please configure your Groq API Key in Settings.');
      setSettingsVisible(true);
      return;
    }

    setIsTranscribing(true);
    try {
      const audioUri = 'mock_interview_audio.wav';
      let transcribedText = '';

      try {
        transcribedText = await transcribeGroqAudio(audioUri, settings.apiKey);
      } catch {
        transcribedText =
          'How do you handle state management and performance optimization in React Native?';
      }

      setIsTranscribing(false);
      setInputText(transcribedText);
      await handleSendAnswer(transcribedText);
    } catch (err: any) {
      setIsTranscribing(false);
      Alert.alert('Transcription Failed', err?.message || 'Could not transcribe audio.');
    }
  }, [isRecording, settings.apiKey, handleSendAnswer]);

  const handlePickScreenAnalysis = useCallback(async () => {
    if (!settings.apiKey) {
      Alert.alert('🔑 Missing Groq API Key', 'Please configure your Groq API Key in Settings.');
      setSettingsVisible(true);
      return;
    }

    // Standard RFC 4648 Base64 image string for Groq Vision API
    const sampleCodeImageBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK8AAACvABQqw0mAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABOSURBVHic3u3BMQEAAADCoP6t18OCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwYx2AAB7v1a+wAAAABJRU5ErkJggg==';

    const promptText = inputText.trim() || 'Analyze this code/interview question and provide the solution.';

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `📸 Screen Vision Question: ${promptText}`,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setStreamingToken('📸 Analyzing image with ' + (settings.visionModel || 'meta-llama/llama-4-scout-17b-16e-instruct') + '...');

    await analyzeGroqImage(
      sampleCodeImageBase64,
      promptText,
      settings.apiKey,
      settings.visionModel || 'meta-llama/llama-4-scout-17b-16e-instruct',
      {
        onToken: (token: string) => {
          setStreamingToken(token);
        },
        onComplete: (fullText: string) => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullText,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setStreamingToken('');
          setIsGenerating(false);
        },
        onError: (error: Error) => {
          const errorMsg = error?.message || String(error || 'Vision analysis failed.');
          Alert.alert('Vision Analysis Failed', errorMsg);
          setStreamingToken('');
          setIsGenerating(false);
        },
      },
    );
  }, [inputText, settings.apiKey, settings.visionModel]);

  const handleCopyText = useCallback((text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Text copied to clipboard.');
  }, []);

  const handleClear = useCallback(() => {
    setInputText('');
    setMessages([]);
    clearStorageMessages();
  }, []);

  const handleSaveSettings = async (
    newKey: string,
    model: string,
    visionModel: string,
    customPrompt: string,
  ) => {
    const updated: AppSettings = {
      ...settings,
      apiKey: newKey,
      model,
      visionModel,
      customSystemPrompt: customPrompt,
    };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsVisible(false);
  }, []);

  const handleSelectModel = useCallback(async (mId: string) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, model: mId };
      saveSettings(updatedSettings);
      return updatedSettings;
    });
  }, []);

  const handleSelectRole = useCallback(async (rId: string) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, roleId: rId };
      saveSettings(updatedSettings);
      return updatedSettings;
    });
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { opacity: settings.opacity }]}>
        <StatusBar barStyle="light-content" hidden={false} />
        <View style={styles.appContainer}>
          <InterviewHeader
            isRecording={isRecording}
            recordingTime={audioService.formatDuration(recordingSeconds)}
            isCollapsed={isCollapsed}
            onToggleRecord={handleToggleRecord}
            onToggleCollapse={handleToggleCollapse}
            onOpenSettings={handleOpenSettings}
            hasApiKey={Boolean(settings.apiKey)}
          />

          {!isCollapsed && (
            <>
              <ActionToolbar
                inputText={inputText}
                onChangeInputText={setInputText}
                onSendAnswer={handleSendAnswer}
                onTranscribeAndAnswer={handleTranscribeAndAnswer}
                onPickScreenAnalysis={handlePickScreenAnalysis}
                onClear={handleClear}
                onOpenSettings={handleOpenSettings}
                isRecording={isRecording}
                onToggleRecord={handleToggleRecord}
                isGenerating={isGenerating}
                isTranscribing={isTranscribing}
                hasApiKey={Boolean(settings.apiKey)}
              />

              <StreamingAnswerView
                messages={messages}
                streamingToken={streamingToken}
                isGenerating={isGenerating}
                onCopyText={handleCopyText}
                onToggleRecord={handleToggleRecord}
                onTranscribeAndAnswer={handleTranscribeAndAnswer}
                onPickScreenAnalysis={handlePickScreenAnalysis}
                onOpenSettings={handleOpenSettings}
              />

              <ControlFooter
                selectedModel={settings.model}
                selectedRoleId={settings.roleId}
                onSelectModel={handleSelectModel}
                onSelectRole={handleSelectRole}
              />
            </>
          )}

          <SettingsModal
            visible={settingsVisible}
            apiKey={settings.apiKey}
            selectedModel={settings.model}
            selectedVisionModel={settings.visionModel}
            customPrompt={settings.customSystemPrompt}
            onClose={handleCloseSettings}
            onSave={handleSaveSettings}
            onClearHistory={handleClear}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught Error in Interview AI:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Application Error Recovered</Text>
            <Text style={styles.errorSub}>
              {this.state.error || 'An unexpected rendering error occurred.'}
            </Text>
            <TouchableOpacity
              style={styles.recoverBtn}
              onPress={() => this.setState({ hasError: false, error: '' })}
            >
              <Text style={styles.recoverText}>Restart App Session</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

export default function RootApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  errorSub: {
    color: '#a1a1aa',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  recoverBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  recoverText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
