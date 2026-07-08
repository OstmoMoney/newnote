import AsyncStorage from "@react-native-async-storage/async-storage";

const STATE_KEY = "newnote_state_v1";
const API_KEY_KEY = "newnote_anthropic_api_key";

// Maks antall lærings-eksempler som beholdes (de nyeste vinner)
const MAX_LEARNING = 40;

export const emptyState = {
  categories: [], // { id, name, emoji, createdAt }
  notes: [], // { id, text, categoryId, createdAt }
  learning: [], // { text, category, source: "auto" | "manual", at }
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

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
