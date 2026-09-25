import Avatar from '@/components/ui/Avatar';
import { useAvatarUrls } from '@/hooks/useAvatarUrls';
import { useMessages, type MessageContact } from '@/hooks/useMessages';
import { fmtDateTime } from '@/utils/dates';
import { Feather } from '@expo/vector-icons';
import { useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function contactLabel(contact: MessageContact) {
  return contact.role === 'admin' ? 'Administrator' : 'Guard';
}

export default function MessagesScreen() {
  const { data, loading, error, refresh, sendMessage, markConversationRead } = useMessages();
  const segments = useSegments();
  const isAdminRoute = segments[0] === '(admin)';
  const { urls: avatarUrls } = useAvatarUrls((data?.contacts ?? []).map((contact) => contact.avatar_path));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const threadRef = useRef<ScrollView | null>(null);
  const selected = data?.contacts.find((contact) => contact.id === selectedId) ?? data?.contacts[0] ?? null;
  const visibleContacts = (data?.contacts ?? []).filter((contact) => {
    const query = contactSearch.trim().toLowerCase();
    return !query || `${contact.full_name} ${contactLabel(contact)}`.toLowerCase().includes(query);
  });
  const thread = selected && data ? data.messages.filter((message) => (message.sender_id === data.userId && message.recipient_id === selected.id) || (message.sender_id === selected.id && message.recipient_id === data.userId)) : [];

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
    if (selected) void markConversationRead(selected.id).catch(() => undefined);
  }, [selected?.id, selectedId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => threadRef.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [selected?.id, thread.length]);

  const send = async () => {
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(selected.id, draft);
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={isAdminRoute ? [] : ['top']}>
      <View style={[styles.header, { paddingTop: 0, paddingBottom: 8 }]}><Text style={[styles.title, { fontSize: 24 }]}>Messages</Text><Feather name="message-circle" size={22} color="#1B2A4A" /></View>
      {loading ? <View style={styles.center}><ActivityIndicator color="#1B2A4A" /><Text style={styles.muted}>Loading messages...</Text></View> : null}
      {!loading && error ? <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void refresh()} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
      {!loading && !error && !data?.contacts.length ? <View style={styles.center}><Text style={styles.muted}>No active contacts are available.</Text></View> : null}
      {!loading && !error && data?.contacts.length ? <>
        <View style={searchStyles.searchBar}>
          <Feather name="search" size={17} color="#667085" />
          <TextInput value={contactSearch} onChangeText={setContactSearch} placeholder="Search contacts" placeholderTextColor="#98A2B3" style={searchStyles.searchInput} autoCapitalize="none" autoCorrect={false} />
          {contactSearch ? <Pressable onPress={() => setContactSearch('')} accessibilityLabel="Clear contact search"><Feather name="x-circle" size={17} color="#667085" /></Pressable> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={contactsScrollStyle} contentContainerStyle={[styles.contacts, { alignItems: 'flex-start' }]}>
          {visibleContacts.map((contact) => <Pressable key={contact.id} onPress={() => setSelectedId(contact.id)} style={[styles.contact, { alignSelf: 'flex-start', flexDirection: 'column', minWidth: 112, paddingHorizontal: 10, paddingVertical: 10 }, selected?.id === contact.id && styles.contactSelected]}><Avatar uri={avatarUrls[contact.avatar_path ?? '']} name={contact.full_name} size="sm" /><Text style={[styles.contactName, { maxWidth: 100, textAlign: 'center' }]} numberOfLines={1}>{contact.full_name}</Text><Text style={[styles.contactRole, { textAlign: 'center' }]}>{contactLabel(contact)}</Text></Pressable>)}
        </ScrollView>
        {selected ? <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={conversationPanelStyle}>
          <View style={styles.threadHeader}><Text style={styles.threadTitle}>{selected.full_name}</Text><Text style={styles.threadSubtitle}>{selected.phone || contactLabel(selected)}</Text></View>
          <ScrollView ref={threadRef} style={styles.thread} contentContainerStyle={styles.threadContent}>{thread.length ? thread.map((message) => { const isSender = message.sender_id === data.userId; return <View key={message.id} style={[styles.message, isSender ? styles.outgoing : styles.incoming]}><Text style={[styles.messageBody, isSender && styles.outgoingBody]}>{message.body}</Text><Text style={[styles.messageTime, isSender && styles.outgoingTime]}>{fmtDateTime(message.created_at)}</Text></View>; }) : <Text style={styles.muted}>Start the conversation.</Text>}</ScrollView>
          <View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} placeholder="Write a message..." placeholderTextColor="#98A2B3" multiline style={styles.input} /><Pressable disabled={sending || !draft.trim()} onPress={() => void send()} style={[styles.send, (sending || !draft.trim()) && styles.sendDisabled]} accessibilityLabel="Send message"><Feather name="send" size={17} color="#FFFFFF" /></Pressable></View>
        </KeyboardAvoidingView> : null}
      </> : null}
    </SafeAreaView>
  );
}

const conversationPanelStyle = { flex: 1, minHeight: 0 } as const;
const contactsScrollStyle = { flexGrow: 0, flexShrink: 0 } as const;
const searchStyles = StyleSheet.create({
  searchBar: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DCE3EC', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 8, marginHorizontal: 20, marginBottom: 4, paddingHorizontal: 12, height: 42 },
  searchInput: { color: '#101828', flex: 1, fontSize: 13, paddingVertical: 0 },
});

const styles = StyleSheet.create({
  safe: { backgroundColor: '#F4F6FA', flex: 1 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 }, title: { color: '#101828', fontSize: 22, fontWeight: '800' }, contacts: { gap: 10, paddingHorizontal: 20, paddingVertical: 8 }, contact: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DCE3EC', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 8, maxWidth: 210, paddingHorizontal: 9, paddingVertical: 7 }, contactSelected: { backgroundColor: '#E8F3F7', borderColor: '#1B2A4A' }, contactIcon: { alignItems: 'center', backgroundColor: '#EEF2F6', borderRadius: 14, height: 26, justifyContent: 'center', width: 26 }, contactName: { color: '#101828', fontSize: 12, fontWeight: '800', maxWidth: 125 }, contactRole: { color: '#667085', fontSize: 10, marginTop: 2 }, threadHeader: { borderBottomColor: '#DCE3EC', borderBottomWidth: 1, paddingHorizontal: 20, paddingVertical: 12 }, threadTitle: { color: '#101828', fontSize: 16, fontWeight: '800' }, threadSubtitle: { color: '#667085', fontSize: 11, marginTop: 2 }, thread: { flex: 1, paddingHorizontal: 20 }, threadContent: { gap: 8, paddingVertical: 16 }, message: { borderRadius: 14, maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 9 }, outgoing: { alignSelf: 'flex-end', backgroundColor: '#1B2A4A' }, incoming: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: '#DCE3EC', borderWidth: 1 }, messageBody: { color: '#101828', fontSize: 13 }, outgoingBody: { color: '#FFFFFF' }, messageTime: { color: '#98A2B3', fontSize: 9, marginTop: 4 }, outgoingTime: { color: '#DCE3EC' }, composer: { alignItems: 'flex-end', backgroundColor: '#FFFFFF', borderTopColor: '#DCE3EC', borderTopWidth: 1, flexDirection: 'row', gap: 8, padding: 12 }, input: { backgroundColor: '#F4F6FA', borderColor: '#DCE3EC', borderRadius: 12, borderWidth: 1, color: '#101828', flex: 1, maxHeight: 96, minHeight: 42, paddingHorizontal: 12, paddingVertical: 10 }, send: { alignItems: 'center', backgroundColor: '#1B2A4A', borderRadius: 12, height: 42, justifyContent: 'center', width: 44 }, sendDisabled: { opacity: 0.45 }, center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 }, muted: { color: '#667085', fontSize: 13, marginTop: 10, textAlign: 'center' }, error: { color: '#B42318', fontSize: 13, textAlign: 'center' }, retry: { backgroundColor: '#1B2A4A', borderRadius: 10, marginTop: 14, paddingHorizontal: 16, paddingVertical: 10 }, retryText: { color: '#FFFFFF', fontWeight: '800' },
});
