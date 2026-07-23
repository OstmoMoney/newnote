import AsyncStorage from "@react-native-async-storage/async-storage";

const STATE_KEY = "newnote_state_v1";
const API_KEY_KEY = "newnote_anthropic_api_key";
const SETTINGS_KEY = "newnote_settings_v1";

// Maks antall lærings-eksempler som beholdes (de nyeste vinner).
// Jo flere, jo bedre "trener" AI-en på dine egne korrigeringer.
const MAX_LEARNING = 80;

export const emptyState = {
  categories: [], // { id, name, emoji, createdAt }
  notes: [], // { id, text, categoryId, createdAt }
  learning: [], // { text, category, source: "auto" | "manual", at }
};

export const defaultSettings = {
  provider: "claude", // "claude" | "ollama"
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.1",
};

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw);
    return {
      categories: parsed.categories || [],
      notes: parsed.notes || [],
      learning: parsed.learning || [],
    };
  } catch {
    return { ...emptyState };
  }
}

export async function saveState(state) {
  const trimmed = {
    ...state,
    learning: state.learning.slice(-MAX_LEARNING),
  };
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export async function loadApiKey() {
  try {
    return (await AsyncStorage.getItem(API_KEY_KEY)) || "";
  } catch {
    return "";
  }
}

export async function saveApiKey(key) {
  await AsyncStorage.setItem(API_KEY_KEY, key.trim());
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings) {
  const merged = { ...defaultSettings, ...settings };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
