import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { COLORS, FONT } from "../theme";

/**
 * Oversikten du swiper til: alle kategorier AI-en har opprettet,
 * med søkefelt, antall notater, siste aktivitet, og sletting.
 */
export default function CategoriesPage({ width, categories, notes, onOpenCategory, onDeleteCategory }) {
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((cat) => {
        const catNotes = notes.filter((n) => n.categoryId === cat.id);
        const lastAt = catNotes.length
          ? catNotes.map((n) => n.createdAt).sort().slice(-1)[0]
          : cat.createdAt;
        return { ...cat, count: catNotes.length, lastAt };
      })
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
  }, [categories, notes, query]);

  const confirmDelete = (cat) => {
    Alert.alert(
      "Slett kategori?",
      `Sletter "${cat.name}" og alle notatene i den.`,
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Slett", style: "destructive", onPress: () => onDeleteCategory(cat) },
      ]
    );
  };

  return (
    <View style={[styles.page, { width }]}>
      <Text style={styles.title}>kategorier</Text>

      {categories.length > 0 && (
        <TextInput
          style={styles.search}
          placeholder="søk etter kategori ..."
          placeholderTextColor={COLORS.textDim}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
        />
      )}

      <FlatList
        data={items}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onOpenCategory(item)}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.rowBody}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.meta}>
                {item.count} {item.count === 1 ? "notat" : "notater"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              hitSlop={12}
              style={styles.trashBtn}
            >
              <Text style={styles.trash}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.trim() ? (
            <Text style={styles.empty}>ingen kategori matcher «{query.trim()}»</Text>
          ) : (
            <Text style={styles.empty}>
              ingen kategorier ennå.{"\n"}skriv et notat og trykk take note —{"\n"}resten ordner seg selv.
            </Text>
          )
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
    marginBottom: 16,
  },
  search: {
    marginHorizontal: 22,
    marginBottom: 14,
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.text,
    fontFamily: FONT.mono,
    fontSize: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
  trashBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  trash: {
    fontSize: 20,
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
