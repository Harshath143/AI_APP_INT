import React, { useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  StatusBar,
  StyleSheet,
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

export default function App() {
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

  const handleToggleRecord = () => {
    if (isRecording) {
      const { durationSeconds } = audioService.stopRecording();
      Alert.alert(
        '🎙 Audio Recorded',
        `Recorded ${audioService.formatDuration(durationSeconds)} of interview audio.\nClick "🔍 Transcribe & Answer" to run Whisper AI.`,
      );
    } else {
      audioService.startRecording();
    }
  };

  const currentSystemPrompt = (): string => {
    if (settings.customSystemPrompt && settings.customSystemPrompt.trim()) {
      return settings.customSystemPrompt;
    }
    const roleOpt = CANDIDATE_ROLES.find(r => r.id === settings.roleId);
    return (
      roleOpt?.systemPrompt ||
      'You are a senior software developer in a technical job interview. Give clear, concise, direct, and optimal answers.'
    );
  };

  const handleSendAnswer = async (queryText?: string) => {
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
      settings.model || 'llama-3.1-8b-instant',
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
          Alert.alert('Error Generating Answer', error.message);
          setStreamingToken('');
          setIsGenerating(false);
        },
      },
    );
  };

  const handleTranscribeAndAnswer = async () => {
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
      // Simulate audio URI or captured buffer
      const audioUri = 'mock_interview_audio.wav';
      let transcribedText = '';

      try {
        transcribedText = await transcribeGroqAudio(audioUri, settings.apiKey);
      } catch {
        // Fallback for demonstration if local wav file is mock
        transcribedText =
          'How do you handle state management and performance optimization in React Native?';
      }

      setIsTranscribing(false);
      setInputText(transcribedText);
      await handleSendAnswer(transcribedText);
    } catch (err: any) {
      setIsTranscribing(false);
      Alert.alert('Transcription Failed', err.message || 'Could not transcribe audio.');
    }
  };

  const handlePickScreenAnalysis = async () => {
    if (!settings.apiKey) {
      Alert.alert('🔑 Missing Groq API Key', 'Please configure your Groq API Key in Settings.');
      setSettingsVisible(true);
      return;
    }

    // Sample base64 screenshot simulation for demonstration
    const sampleCodeImageBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const promptText = inputText.trim() || 'Analyze this code/interview question and provide the solution.';

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `📸 Screen Vision Question: ${promptText}`,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setStreamingToken('📸 Analyzing image with ' + (settings.visionModel || 'llama-4-scout') + '...');

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
          Alert.alert('Vision Analysis Failed', error.message);
          setStreamingToken('');
          setIsGenerating(false);
        },
      },
    );
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Text copied to clipboard.');
  };

  const handleClear = () => {
    setInputText('');
    setMessages([]);
    clearStorageMessages();
  };

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
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onOpenSettings={() => setSettingsVisible(true)}
            hasApiKey={Boolean(settings.apiKey)}
          />

          {!isCollapsed && (
            <>
              <ActionToolbar
                inputText={inputText}
                onChangeInputText={setInputText}
                onSendAnswer={() => handleSendAnswer()}
                onTranscribeAndAnswer={handleTranscribeAndAnswer}
                onPickScreenAnalysis={handlePickScreenAnalysis}
                onClear={handleClear}
                isGenerating={isGenerating}
                isTranscribing={isTranscribing}
              />

              <StreamingAnswerView
                messages={messages}
                streamingToken={streamingToken}
                isGenerating={isGenerating}
                onCopyText={handleCopyText}
              />

              <ControlFooter
                selectedModel={settings.model}
                selectedRoleId={settings.roleId}
                audioMode={settings.audioMode}
                opacity={settings.opacity}
                onSelectModel={async mId => {
                  const updatedSettings = { ...settings, model: mId };
                  setSettings(updatedSettings);
                  await saveSettings(updatedSettings);
                }}
                onSelectRole={async rId => {
                  const updatedSettings = { ...settings, roleId: rId };
                  setSettings(updatedSettings);
                  await saveSettings(updatedSettings);
                }}
                onToggleAudioMode={async () => {
                  const nextMode: AudioSourceMode =
                    settings.audioMode === 'mic'
                      ? 'system'
                      : settings.audioMode === 'system'
                      ? 'both'
                      : 'mic';
                  const updatedSettings = { ...settings, audioMode: nextMode };
                  setSettings(updatedSettings);
                  await saveSettings(updatedSettings);
                }}
                onChangeOpacity={async newOpacity => {
                  const updatedSettings = { ...settings, opacity: newOpacity };
                  setSettings(updatedSettings);
                  await saveSettings(updatedSettings);
                }}
              />
            </>
          )}

          <SettingsModal
            visible={settingsVisible}
            apiKey={settings.apiKey}
            selectedModel={settings.model}
            selectedVisionModel={settings.visionModel}
            customPrompt={settings.customSystemPrompt}
            onClose={() => setSettingsVisible(false)}
            onSave={handleSaveSettings}
            onClearHistory={handleClear}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
