import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, FONT } from "../theme";
import { defaultSettings } from "../lib/storage";

export default function SettingsModal({ visible, apiKey, settings, onSave, onClose }) {
  const [value, setValue] = useState(apiKey);
  const [provider, setProvider] = useState(settings?.provider || "claude");
  const [ollamaUrl, setOllamaUrl] = useState(settings?.ollamaUrl || defaultSettings.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(
    settings?.ollamaModel || defaultSettings.ollamaModel
  );

  useEffect(() => {
    if (!visible) return;
    setValue(apiKey);
    setProvider(settings?.provider || "claude");
    setOllamaUrl(settings?.ollamaUrl || defaultSettings.ollamaUrl);
    setOllamaModel(settings?.ollamaModel || defaultSettings.ollamaModel);
  }, [visible, apiKey, settings]);

  const save = () => {
    onSave({
      apiKey: value,
      settings: {
        provider,
        ollamaUrl: ollamaUrl.trim(),
        ollamaModel: ollamaModel.trim(),
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>innstillinger</Text>

            <Text style={styles.label}>AI-motor</Text>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, provider === "claude" && styles.toggleActive]}
                onPress={() => setProvider("claude")}
              >
                <Text style={[styles.toggleText, provider === "claude" && styles.toggleTextActive]}>
                  Claude
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, provider === "ollama" && styles.toggleActive]}
                onPress={() => setProvider("ollama")}
              >
                <Text style={[styles.toggleText, provider === "ollama" && styles.toggleTextActive]}>
                  Ollama (lokal)
                </Text>
              </TouchableOpacity>
            </View>

            {provider === "claude" ? (
              <View>
                <Text style={styles.label}>Anthropic API-nøkkel</Text>
                <TextInput
                  style={styles.input}
                  placeholder="sk-ant-..."
                  placeholderTextColor={COLORS.textDim}
                  value={value}
                  onChangeText={setValue}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  keyboardAppearance="dark"
                />
                <Text style={styles.hint}>
                  Nøkkelen lagres kun lokalt på enheten og brukes til å kategorisere
                  notatene dine med Claude. Bruker credits.
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Ollama-adresse</Text>
                <TextInput
                  style={styles.input}
                  placeholder="http://192.168.1.10:11434"
                  placeholderTextColor={COLORS.textDim}
                  value={ollamaUrl}
                  onChangeText={setOllamaUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardAppearance="dark"
                />
                <Text style={styles.label}>Modell</Text>
                <TextInput
                  style={styles.input}
                  placeholder="llama3.1"
                  placeholderTextColor={COLORS.textDim}
                  value={ollamaModel}
                  onChangeText={setOllamaModel}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardAppearance="dark"
                />
                <Text style={styles.hint}>
                  Gratis og lokalt — bruker ingen Claude-credits. Ollama må kjøre på
                  PC-en din. Fra mobilen: bruk PC-ens IP-adresse (ikke localhost), og
                  start Ollama med OLLAMA_HOST=0.0.0.0 så telefonen når den.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveText}>LAGRE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>lukk</Text>
            </TouchableOpacity>
          </ScrollView>
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
    marginBottom: 16,
  },
  label: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },
  toggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  toggleBtn: {
    flex: 1,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  toggleText: {
    fontFamily: FONT.mono,
    fontSize: 19,
    color: COLORS.textDim,
  },
  toggleTextActive: {
    color: "#000",
  },
  input: {
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.text,
    fontFamily: FONT.mono,
    fontSize: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hint: {
    fontFamily: FONT.mono,
    fontSize: 17,
    color: COLORS.textDim,
    marginTop: 10,
    lineHeight: 20,
  },
  saveBtn: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 18,
  },
  saveText: {
    fontFamily: FONT.pixel,
    fontSize: 11,
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
