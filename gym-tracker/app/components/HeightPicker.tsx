import { useEffect, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PADDING_ROWS = Math.floor(VISIBLE_ROWS / 2);

type WheelProps = {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  suffix: string;
};

function Wheel({ items, value, onChange, suffix }: WheelProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const index = Math.max(0, items.indexOf(value));

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [index, items.length]);

  const snapToIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = e.nativeEvent.contentOffset.y / ITEM_HEIGHT;
    const nextIndex = Math.min(items.length - 1, Math.max(0, Math.round(raw)));
    onChange(items[nextIndex]);
    scrollRef.current?.scrollTo({ y: nextIndex * ITEM_HEIGHT, animated: true });
  };

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE_ROWS, flex: 1, overflow: "hidden" }}>
      {/* Selection frame — border only so scrolled text stays visible */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: ITEM_HEIGHT * PADDING_ROWS,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: colors.primary,
          backgroundColor: "transparent",
          zIndex: 0,
        }}
      />
      <ScrollView
        ref={scrollRef}
        style={{ zIndex: 1 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={snapToIndex}
        onScrollEndDrag={snapToIndex}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * PADDING_ROWS }}
      >
        {items.map((item) => {
          const selected = item === value;
          return (
            <View key={item} style={{ height: ITEM_HEIGHT, alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: selected ? 22 : 18,
                  fontWeight: selected ? "700" : "500",
                  color: selected ? colors.primary : colors.textSecondary,
                  opacity: selected ? 1 : 0.45,
                }}
              >
                {item} {suffix}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const FEET_OPTIONS = [3, 4, 5, 6, 7, 8];
export const INCH_OPTIONS = Array.from({ length: 13 }, (_, i) => i);

export function inchesToFeetInches(totalInches: number | null | undefined): { feet: number; inches: number } {
  if (totalInches == null || totalInches < 36) return { feet: 5, inches: 6 };
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return {
    feet: Math.min(8, Math.max(3, feet)),
    inches: Math.min(12, Math.max(0, inches)),
  };
}

export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

type Props = {
  feet: number;
  inches: number;
  onFeetChange: (feet: number) => void;
  onInchesChange: (inches: number) => void;
};

export default function HeightPicker({ feet, inches, onFeetChange, onInchesChange }: Props) {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 8 }}>
        Height (optional)
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
        <Wheel items={FEET_OPTIONS} value={feet} onChange={onFeetChange} suffix="ft" />
        <Wheel items={INCH_OPTIONS} value={inches} onChange={onInchesChange} suffix="in" />
      </View>
      <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: "center", marginBottom: 8 }}>
        {feet} ft {inches} in
      </Text>
    </View>
  );
}
