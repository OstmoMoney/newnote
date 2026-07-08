import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { COLORS, FONT } from "../theme";

export default function Toast({ message }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    backgroundColor: COLORS.surfaceHi,
    borderColor: COLORS.yellow,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  text: {
    fontFamily: FONT.mono,
    fontSize: 20,
    color: COLORS.yellow,
  },
});
