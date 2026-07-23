import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, FONT } from "../theme";

/**
 * Hovedsiden: bare et skrivefelt og "Take note".
 * Kategoriene er usynlige herfra — AI-en plasserer notatet når du trykker send.
 */
export default function NotePage({
  width,
  busy,
  recentNotes,
  categoriesById,
  onSend,
  onOpenNote,
  onOpenSettings,
}) {
  const [text, setText] = useState("");

  const send = () => {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    onSend(value);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.page, { width }]}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>newnote</Text>
        <TouchableOpacity onPress={onOpenSettings} hitSlop={12}>
          <Text style={styles.gear}>⚙</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        multiline
        placeholder="skriv et notat ..."
        placeholderTextColor={COLORS.textDim}
        value={text}
        onChangeText={setText}
        keyboardAppearance="dark"
      />

      <TouchableOpacity
        style={[styles.sendBtn, (busy || !text.trim()) && styles.sendBtnDisabled]}
        onPress={send}
        disabled={busy || !text.trim()}
      >
        <Text style={styles.sendText}>TAKE NOTE</Text>
      </TouchableOpacity>

      {recentNotes.length > 0 && (
        <View style={styles.recent}>
          <Text style={styles.recentTitle}>nylig</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {recentNotes.map((note) => {
              const cat = categoriesById[note.categoryId];
              return (
                <TouchableOpacity
                  key={note.id}
                  activeOpacity={0.7}
                  onPress={() => onOpenNote(note)}
                  style={styles.recentRow}
                >
                  <Text style={styles.recentText} numberOfLines={2}>
                    {note.text}
                  </Text>
                  <Text style={styles.recentTag}>{cat ? `${cat.emoji} ${cat.name}` : ""}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.recentHint}>trykk på et notat for å endre eller flytte</Text>
        </View>
      )}

      <Text style={styles.swipeHint}>{"<- swipe for kategorier"}</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 66,
    paddingHorizontal: 22,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 26,
  },
  logo: {
    fontFamily: FONT.pixel,
    fontSize: 26,
    color: COLORS.yellow,
    textShadowColor: "rgba(255, 212, 0, 0.4)",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  gear: {
    fontSize: 22,
    color: COLORS.yellowDim,
  },
  input: {
    minHeight: 210,
    maxHeight: 340,
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.text,
    fontFamily: FONT.mono,
    fontSize: 25,
    lineHeight: 30,
    padding: 16,
    textAlignVertical: "top",
  },
  sendBtn: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendText: {
    fontFamily: FONT.pixel,
    fontSize: 13,
    color: "#000",
  },
  recent: {
    flex: 1,
    marginTop: 26,
  },
  recentTitle: {
    fontFamily: FONT.mono,
    fontSize: 18,
    color: COLORS.yellowDim,
    marginBottom: 8,
  },
  recentRow: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  recentText: {
    fontFamily: FONT.mono,
    fontSize: 21,
    color: COLORS.text,
  },
  recentTag: {
    fontFamily: FONT.mono,
    fontSize: 16,
    color: COLORS.textDim,
    marginTop: 2,
  },
  recentHint: {
    fontFamily: FONT.mono,
    fontSize: 15,
    color: COLORS.textDim,
    marginTop: 6,
  },
  swipeHint: {
    fontFamily: FONT.mono,
    fontSize: 17,
    color: COLORS.yellowDim,
    textAlign: "center",
    paddingBottom: 26,
    paddingTop: 8,
  },
});
