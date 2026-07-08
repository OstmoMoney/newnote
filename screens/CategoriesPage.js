import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { COLORS, FONT } from "../theme";

/**
 * Oversikten du swiper til: alle kategorier AI-en har opprettet,
 * med antall notater og siste aktivitet.
 */
export default function CategoriesPage({ width, categories, notes, onOpenCategory }) {
  const items = categories
    .map((cat) => {
      const catNotes = notes.filter((n) => n.categoryId === cat.id);
      const lastAt = catNotes.length
        ? catNotes.map((n) => n.createdAt).sort().slice(-1)[0]
        : cat.createdAt;
      return { ...cat, count: catNotes.length, lastAt };
    })
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  return (
    <View style={[styles.page, { width }]}>
      <Text style={styles.title}>kategorier</Text>
      <FlatList
        data={items}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onOpenCategory(item)}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.count} {item.count === 1 ? "notat" : "notater"}
              </Text>
            </View>
            <Text style={styles.chevron}>{">"}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            ingen kategorier ennå.{"\n"}skriv et notat og trykk send —{"\n"}resten ordner seg selv.
          </Text>
        }
      />
      <Text style={styles.swipeHint}>{"swipe for å skrive ->"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 66,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontFamily: FONT.pixel,
    fontSize: 16,
    color: COLORS.yellow,
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: COLORS.border,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  emoji: {
    fontSize: 26,
  },
  rowBody: {
    flex: 1,
  },
  name: {
    fontFamily: FONT.mono,
    fontSize: 24,
    color: COLORS.text,
  },
  meta: {
    fontFamily: FONT.mono,
    fontSize: 16,
    color: COLORS.textDim,
  },
  chevron: {
    fontFamily: FONT.pixel,
    fontSize: 12,
    color: COLORS.yellowDim,
  },
  empty: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.textDim,
    marginTop: 60,
    textAlign: "center",
    lineHeight: 26,
  },
  swipeHint: {
    fontFamily: FONT.mono,
    fontSize: 17,
    color: COLORS.yellowDim,
    textAlign: "center",
    paddingBottom: 26,
  },
});
