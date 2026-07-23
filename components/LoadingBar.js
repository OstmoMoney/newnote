import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { COLORS } from "../theme";

const { width } = Dimensions.get("window");
const SEGMENT = Math.round(width * 0.4);

/**
 * Tynn gul lastelinje øverst på skjermen — vises mens et notat kategoriseres.
 * Erstatter "loading"-spinner: et lysende segment sklir over toppen i loop.
 */
export default function LoadingBar({ active }) {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    x.setValue(0);
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  if (!active) return null;

  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-SEGMENT, width],
  });

  return (
    <View style={styles.track} pointerEvents="none">
      <Animated.View style={[styles.segment, { transform: [{ translateX }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255, 212, 0, 0.12)",
    overflow: "hidden",
    zIndex: 100,
    elevation: 100,
  },
  segment: {
    width: SEGMENT,
    height: 4,
    backgroundColor: COLORS.yellow,
    shadowColor: COLORS.yellow,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
