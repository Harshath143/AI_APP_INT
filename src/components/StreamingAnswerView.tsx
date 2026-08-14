import React, { useRef } from 'react';
import {
  FlatList,
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
}

export const StreamingAnswerView: React.FC<Props> = ({
  messages,
  streamingToken,
  isGenerating,
  onCopyText,
}) => {
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageCard,
          isUser ? styles.userCard : styles.assistantCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.roleBadge, isUser ? styles.userRole : styles.botRole]}>
            {isUser ? '👤 Question' : '🤖 AI Answer'}
          </Text>
          <TouchableOpacity
            onPress={() => onCopyText(item.content)}
            activeOpacity={0.6}
            style={styles.copyBtn}
          >
            <Text style={styles.copyText}>📋 Copy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.messageContent} selectable>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          isGenerating && streamingToken ? (
            <View style={[styles.messageCard, styles.assistantCard, styles.streamingCard]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.roleBadge, styles.botRole]}>
                  ⚡ Streaming Answer...
                </Text>
              </View>
              <Text style={styles.messageContent} selectable>
                {streamingToken}
                <Text style={styles.cursor}>▌</Text>
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Interview AI Companion Ready</Text>
            <Text style={styles.emptySub}>
              • Click ▶ Record to capture interviewer spoken question{'\n'}
              • Click 🔍 Transcribe & Answer for Whisper AI{'\n'}
              • Click 📸 Screen Vision for code snippet analysis{'\n'}
              • Or type custom questions directly in the toolbar
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  messageCard: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  userCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  assistantCard: {
    backgroundColor: '#090d16',
    borderColor: '#1e293b',
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
  },
  streamingCard: {
    borderColor: '#38bdf8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  userRole: {
    color: '#94a3b8',
  },
  botRole: {
    color: '#38bdf8',
  },
  copyBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  copyText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  messageContent: {
    color: '#f1f5f9',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Platform',
  },
  cursor: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
});
