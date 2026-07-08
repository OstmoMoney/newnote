import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, FONT } from "../theme";

/**
 * Felles kategori-velger.
 * Brukes både som "AI er usikker"-popup (med to kandidater øverst)
 * og som manuell velger ved dobbelttrykk på et notat.
 */
export default function CategoryChooser({
  visible,
  title,
  noteText,
  candidates = [],
  categories,
  onPick,
  onCreate,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");

  const close = () => {
    setQuery("");
    setNewName("");
    onClose();
  };

  const pick = (name) => {
    setQuery("");
    setNewName("");
    onPick(name);
  };

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    setQuery("");
    setNewName("");
    onCreate(name);
  };

  const candidateSet = new Set(candidates.map((c) => c.toLowerCase()));
  const filtered = categories.filter(
    (c) =>
      !candidateSet.has(c.name.toLowerCase()) &&
      c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {!!noteText && (
            <Text style={styles.note} numberOfLines={3}>
              «{noteText}»
            </Text>
          )}

          {candidates.length > 0 && (
            <View style={styles.candidates}>
              {candidates.map((name) => {
                const cat = categories.find(
                  (c) => c.name.toLowerCase() === name.toLowerCase()
                );
                return (
                  <TouchableOpacity
                    key={name}
                    style={styles.candidateBtn}
                    onPress={() => pick(cat ? cat.name : name)}
                  >
                    <Text style={styles.candidateText}>
                      {cat ? `${cat.emoji} ${cat.name}` : name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TextInput
            style={styles.search}
            placeholder="søk i kategorier ..."
            placeholderTextColor={COLORS.textDim}
            value={query}
            onChangeText={setQuery}
            keyboardAppearance="dark"
          />

          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => pick(item.name)}>
                <Text style={styles.rowText}>
                  {item.emoji} {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>ingen treff</Text>
            }
          />

          <View style={styles.createRow}>
            <TextInput
              style={[styles.search, styles.createInput]}
              placeholder="ny kategori ..."
              placeholderTextColor={COLORS.textDim}
              value={newName}
              onChangeText={setNewName}
              onSubmitEditing={create}
              keyboardAppearance="dark"
            />
            <TouchableOpacity style={styles.createBtn} onPress={create}>
              <Text style={styles.createBtnText}>OPPRETT</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={close} style={styles.cancel}>
            <Text style={styles.cancelText}>avbryt</Text>
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
    maxHeight: "85%",
  },
  title: {
    fontFamily: FONT.pixel,
    fontSize: 12,
    color: COLORS.yellow,
    marginBottom: 12,
    lineHeight: 18,
  },
  note: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 14,
  },
  candidates: {
    gap: 8,
    marginBottom: 14,
  },
  candidateBtn: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  candidateText: {
    fontFamily: FONT.mono,
    fontSize: 22,
    color: "#000",
  },
  search: {
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.text,
    fontFamily: FONT.mono,
    fontSize: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  list: {
    maxHeight: 200,
    marginBottom: 10,
  },
  row: {
    paddingVertical: 10,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  rowText: {
    fontFamily: FONT.mono,
    fontSize: 22,
    color: COLORS.text,
  },
  empty: {
    fontFamily: FONT.mono,
    fontSize: 18,
    color: COLORS.textDim,
    paddingVertical: 10,
  },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  createInput: {
    flex: 1,
    marginBottom: 0,
  },
  createBtn: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  createBtnText: {
    fontFamily: FONT.pixel,
    fontSize: 9,
    color: "#000",
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
