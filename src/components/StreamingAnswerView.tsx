import React, { useRef } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChatMessage } from '../types/chat';

interface Props {
  messages: ChatMessage[];
  streamingToken: string;
  isGenerating: boolean;
  onCopyText: (text: string) => void;
  onToggleRecord?: () => void;
  onTranscribeAndAnswer?: () => void;
  onPickScreenAnalysis?: () => void;
  onOpenSettings?: () => void;
}

export const StreamingAnswerView: React.FC<Props> = React.memo(({
  messages,
  streamingToken,
  isGenerating,
  onCopyText,
  onToggleRecord,
  onTranscribeAndAnswer,
  onPickScreenAnalysis,
  onOpenSettings,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (!item) return null;
    const isUser = item.role === 'user';
    const messageContent = item.content || '';
    return (
      <View
        style={[
          styles.messageCard,
          isUser ? styles.userCard : styles.assistantCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.roleBadge, isUser ? styles.userRole : styles.botRole]}>
            {isUser ? 'Question' : 'AI Copilot'}
          </Text>
          <TouchableOpacity
            onPress={() => onCopyText(messageContent)}
            activeOpacity={0.6}
            style={styles.copyBtn}
          >
            <Text style={styles.copyText}>COPY</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.messageContent} selectable>
          {messageContent}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages || []}
        keyExtractor={(item, index) => (item && item.id ? item.id : `msg-${index}`)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          isGenerating && streamingToken ? (
            <View style={[styles.messageCard, styles.assistantCard, styles.streamingCard]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.roleBadge, styles.botRole]}>
                  Generating response...
                </Text>
              </View>
              <Text style={styles.messageContent} selectable>
                {streamingToken}
                <Text style={styles.cursor}> ▌</Text>
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.heroCircle}>
              <Text style={styles.heroIcon}>✦</Text>
            </View>

            <Text style={styles.emptyTitle}>Companion Ready</Text>

            <View style={styles.gridContainer}>
              <TouchableOpacity
                style={styles.gridCard}
                onPress={onToggleRecord}
                activeOpacity={0.7}
              >
                <Text style={styles.cardIcon}>🎙</Text>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>Speech Capture</Text>
                  <Text style={styles.cardSub}>Tap to record live voice audio</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridCard}
                onPress={onTranscribeAndAnswer}
                activeOpacity={0.7}
              >
                <Text style={styles.cardIcon}>⚡</Text>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>Instant Answer</Text>
                  <Text style={styles.cardSub}>Groq LLaMA 3.3 engine</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridCard}
                onPress={onPickScreenAnalysis}
                activeOpacity={0.7}
              >
                <Text style={styles.cardIcon}>👁</Text>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>Vision Analysis</Text>
                  <Text style={styles.cardSub}>Scan code & diagrams</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridCard}
                onPress={onOpenSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.cardIcon}>💬</Text>
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>Custom Context</Text>
                  <Text style={styles.cardSub}>Configure role & prompt</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  messageCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  assistantCard: {
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderLeftWidth: 3,
    borderLeftColor: '#ffffff',
  },
  streamingCard: {
    borderColor: '#52525b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  userRole: {
    color: '#a1a1aa',
  },
  botRole: {
    color: '#ffffff',
  },
  copyBtn: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyText: {
    color: '#d4d4d8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  messageContent: {
    color: '#f4f4f5',
    fontSize: 14,
    lineHeight: 22,
  },
  cursor: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  heroCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    color: '#ffffff',
    fontSize: 24,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif-medium',
    textShadowColor: 'rgba(255, 255, 255, 0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  gridContainer: {
    width: '100%',
    gap: 10,
  },
  gridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 14,
    gap: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif-medium',
  },
  cardSub: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});



