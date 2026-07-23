import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
} from "react-native";
import { COLORS, FONT } from "../theme";

function dateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "i dag";
  if (sameDay(d, yesterday)) return "i går";
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Viser alle notater i en kategori, kronologisk gruppert på dato.
 * Trykk på et notat = åpne redigering (endre tekst / flytt / slett).
 */
export default function CategoryDetail({ category, notes, onClose, onOpenNote }) {
  // Grupper kronologisk (nyeste dag først, eldste notat først innen dagen)
  const sorted = [...notes].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const groups = [];
  for (const note of sorted) {
    const label = dateLabel(note.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.title === label) last.data.push(note);
    else groups.push({ title: label, data: [note] });
  }
  groups.reverse();

  return (
    <Modal visible={!!category} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.back}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {category ? `${category.emoji} ${category.name}` : ""}
          </Text>
        </View>

        <SectionList
          sections={groups}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text style={styles.dateHeader}>── {section.title} ──</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onOpenNote(item)}
              style={styles.noteRow}
            >
              <Text style={styles.noteText}>{item.text}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>ingen notater ennå</Text>}
        />

        <Text style={styles.hint}>trykk på et notat for å endre, flytte eller slette</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 14,
  },
  back: {
    fontFamily: FONT.pixel,
    fontSize: 16,
    color: COLORS.yellow,
  },
  title: {
    fontFamily: FONT.pixel,
    fontSize: 13,
    color: COLORS.yellow,
    flex: 1,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  dateHeader: {
    fontFamily: FONT.mono,
    fontSize: 18,
    color: COLORS.yellowDim,
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: COLORS.bg,
  },
  noteRow: {
    borderLeftColor: COLORS.yellow,
    borderLeftWidth: 2,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  noteText: {
    fontFamily: FONT.mono,
    fontSize: 22,
    color: COLORS.text,
    lineHeight: 26,
  },
  empty: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.textDim,
    marginTop: 40,
    textAlign: "center",
  },
  hint: {
    fontFamily: FONT.mono,
    fontSize: 16,
    color: COLORS.textDim,
    textAlign: "center",
    paddingBottom: 26,
  },
});
