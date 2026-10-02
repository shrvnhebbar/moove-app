import React, { createContext, useContext, useRef, useState, useCallback } from "react";
import { Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "../components/Toast";

const ToastContext = createContext(null);
const DEFAULT_DURATION = 3500;
const HIDDEN_Y = -150;

// Mounted once at the app root. Call useToast().showToast({...}) from any
// screen to pop this banner in over the top of whatever's on screen.
// Toasts are queued: each one gets its full visible duration before the next
// one (if any) slides in - a burst of calls plays them one after another
// rather than cutting each other off or stacking.
export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const queueRef = useRef([]);
  const showingRef = useRef(false);
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) {
      showingRef.current = false;
      setToast(null);
      return;
    }
    showingRef.current = true;
    setToast(next);
    translateY.setValue(HIDDEN_Y);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    timerRef.current = setTimeout(hideCurrent, next.duration);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- hideCurrent is a stable function declared below, read at call time

  const hideCurrent = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: HIDDEN_Y, duration: 220, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => showNext());
  }, [showNext]);

  // variant: "success" | "warning" | "error". icon: any lucide icon component.
  const showToast = useCallback(
    ({ variant = "success", icon, title, message, duration = DEFAULT_DURATION }) => {
      queueRef.current.push({ variant, icon, title, message, duration });
      if (!showingRef.current) showNext();
    },
    [showNext]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: insets.top + 8,
            left: 16,
            right: 16,
            transform: [{ translateY }],
            opacity,
            zIndex: 999,
            elevation: 999,
          }}
        >
          <Toast {...toast} onPress={hideCurrent} />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
