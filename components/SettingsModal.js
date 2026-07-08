import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, FONT } from "../theme";

export default function SettingsModal({ visible, apiKey, onSave, onClose }) {
  const [value, setValue] = useState(apiKey);

  useEffect(() => {
    if (visible) setValue(apiKey);
  }, [visible, apiKey]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>innstillinger</Text>
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
            notatene dine med Claude.
          </Text>
          <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(value)}>
            <Text style={styles.saveText}>LAGRE</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  label: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 6,
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
    marginTop: 16,
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
