import { useEffect, useRef, useState } from "react";
import { ScrollView, Dimensions, View, StyleSheet } from "react-native";
import {
  loadState,
  saveState,
  loadApiKey,
  saveApiKey,
  makeId,
  emptyState,
} from "../lib/storage";
import { categorizeNote } from "../lib/ai";
import NotePage from "./NotePage";
import CategoriesPage from "./CategoriesPage";
import CategoryDetail from "../components/CategoryDetail";
import CategoryChooser from "../components/CategoryChooser";
import SettingsModal from "../components/SettingsModal";
import Toast from "../components/Toast";
import { COLORS } from "../theme";

const { width } = Dimensions.get("window");

export default function Main() {
  const [state, setState] = useState(emptyState);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState(null);
  // chooser: { mode: "ambiguous", text, candidates } | { mode: "move", note }
  const [chooser, setChooser] = useState(null);

  const toastTimer = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadState().then(setState);
    loadApiKey().then(setApiKey);
    return () => clearTimeout(toastTimer.current);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  };

  const persist = async (next) => {
    setState(next);
    await saveState(next);
  };

  // Finn eksisterende kategori (case-insensitivt) eller opprett en ny.
  const resolveCategory = (draft, name, emoji) => {
    const found = draft.categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (found) return { category: found, created: false };
    const category = {
      id: makeId(),
      name,
      emoji: emoji || "📁",
      createdAt: new Date().toISOString(),
    };
    draft.categories = [...draft.categories, category];
    return { category, created: true };
  };

  const addNote = async ({ text, categoryName, emoji, source }) => {
    const draft = { ...state, categories: [...state.categories] };
    const { category, created } = resolveCategory(draft, categoryName, emoji);
    draft.notes = [
      ...draft.notes,
      { id: makeId(), text, categoryId: category.id, createdAt: new Date().toISOString() },
    ];
    draft.learning = [
      ...draft.learning,
      { text, category: category.name, source, at: new Date().toISOString() },
    ];
    await persist(draft);
    showToast(
      created
        ? `ny kategori: ${category.emoji} ${category.name}`
        : `-> ${category.emoji} ${category.name}`
    );
  };

  const handleSend = async (text) => {
    if (!apiKey) {
      showToast("legg inn API-nøkkel først");
      setSettingsOpen(true);
      return;
    }
    setBusy(true);
    try {
      const result = await categorizeNote({
        apiKey,
        text,
        categories: state.categories,
        notes: state.notes,
        learning: state.learning,
      });
      if (result.action === "ambiguous") {
        setChooser({
          mode: "ambiguous",
          text: result.cleanedNote,
          candidates: result.candidates,
        });
      } else {
        await addNote({
          text: result.cleanedNote,
          categoryName: result.category,
          emoji: result.emoji,
          source: "auto",
        });
      }
    } catch (err) {
      showToast(`feil: ${err.message || "ukjent"}`);
    } finally {
      setBusy(false);
    }
  };

  const moveNote = async (note, categoryName) => {
    const draft = { ...state, categories: [...state.categories] };
    const { category } = resolveCategory(draft, categoryName);
    draft.notes = state.notes.map((n) =>
      n.id === note.id ? { ...n, categoryId: category.id } : n
    );
    // Manuell flytting er det sterkeste læringssignalet
    draft.learning = [
      ...draft.learning,
      { text: note.text, category: category.name, source: "manual", at: new Date().toISOString() },
    ];
    await persist(draft);
    showToast(`flyttet -> ${category.emoji} ${category.name}`);
  };

  const deleteNote = async (note) => {
    await persist({ ...state, notes: state.notes.filter((n) => n.id !== note.id) });
    showToast("slettet");
  };

  const handleChooserPick = async (name) => {
    const current = chooser;
    setChooser(null);
    if (!current) return;
    if (current.mode === "ambiguous") {
      await addNote({ text: current.text, categoryName: name, source: "manual" });
    } else {
      await moveNote(current.note, name);
    }
  };

  const handleSaveKey = async (key) => {
    await saveApiKey(key);
    setApiKey(key.trim());
    setSettingsOpen(false);
    showToast("nøkkel lagret");
  };

  const categoriesById = Object.fromEntries(state.categories.map((c) => [c.id, c]));
  const recentNotes = [...state.notes].slice(-6).reverse();
  const detailNotes = detailCategory
    ? state.notes.filter((n) => n.categoryId === detailCategory.id)
    : [];

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <NotePage
          width={width}
          busy={busy}
          recentNotes={recentNotes}
          categoriesById={categoriesById}
          onSend={handleSend}
          onDoubleTapNote={(note) => setChooser({ mode: "move", note })}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <CategoriesPage
          width={width}
          categories={state.categories}
          notes={state.notes}
          onOpenCategory={setDetailCategory}
        />
      </ScrollView>

      <Toast message={toast} />

      <CategoryChooser
        visible={!!chooser}
        title={chooser?.mode === "ambiguous" ? "hvor skal denne?" : "flytt til ..."}
        noteText={chooser?.mode === "ambiguous" ? chooser.text : chooser?.note?.text}
        candidates={chooser?.mode === "ambiguous" ? chooser.candidates : []}
        categories={state.categories}
        onPick={handleChooserPick}
        onCreate={handleChooserPick}
        onClose={() => setChooser(null)}
      />

      <CategoryDetail
        category={detailCategory}
        notes={detailNotes}
        onClose={() => setDetailCategory(null)}
        onDoubleTapNote={(note) => setChooser({ mode: "move", note })}
        onDeleteNote={deleteNote}
      />

      <SettingsModal
        visible={settingsOpen}
        apiKey={apiKey}
        onSave={handleSaveKey}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
