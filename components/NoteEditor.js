import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { COLORS, FONT } from "../theme";

/**
 * Redigerer et lagret notat: endre teksten, flytt til annen kategori, eller slett.
 * Åpnes når du trykker på et notat (i "nylig"-listen eller inne i en kategori).
 */
export default function NoteEditor({ note, categoryLabel, onSave, onMove, onDelete, onClose }) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(note ? note.text : "");
  }, [note]);

  const save = () => {
    const value = text.trim();
    if (!value) return;
    onSave(value);
  };

  const confirmDelete = () => {
    Alert.alert("Slett notat?", note?.text, [
      { text: "Avbryt", style: "cancel" },
      { text: "Slett", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <Modal visible={!!note} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>rediger notat</Text>
          {!!categoryLabel && <Text style={styles.cat}>{categoryLabel}</Text>}

          <TextInput
            style={styles.input}
            multiline
            value={text}
            onChangeText={setText}
            autoFocus
            placeholder="notattekst ..."
            placeholderTextColor={COLORS.textDim}
            keyboardAppearance="dark"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveText}>LAGRE</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onMove}>
              <Text style={styles.actionText}>flytt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={confirmDelete}>
              <Text style={[styles.actionText, styles.deleteText]}>slett</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>lukk</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.yellow,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    fontFamily: FONT.pixel,
    fontSize: 12,
    color: COLORS.yellow,
    marginBottom: 8,
  },
  cat: {
    fontFamily: FONT.mono,
    fontSize: 18,
    color: COLORS.textDim,
    marginBottom: 12,
  },
  input: {
    minHeight: 120,
    maxHeight: 260,
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.text,
    fontFamily: FONT.mono,
    fontSize: 22,
    lineHeight: 26,
    padding: 12,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  saveText: {
    fontFamily: FONT.pixel,
    fontSize: 11,
    color: "#000",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 11,
    alignItems: "center",
  },
  actionText: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.text,
  },
  deleteText: {
    color: COLORS.danger,
  },
  cancel: {
    marginTop: 14,
    alignSelf: "center",
  },
  cancelText: {
    fontFamily: FONT.mono,
    fontSize: 19,
    color: COLORS.textDim,
  },
});
