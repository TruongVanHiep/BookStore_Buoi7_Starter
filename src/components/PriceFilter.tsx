import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PRICE_RANGES, PriceRange } from "../utils/filters";
import { colors, radius } from "../theme";

interface Props {
  value: PriceRange;
  onChange: (v: PriceRange) => void;
}

export function PriceFilter({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PRICE_RANGES.map((r) => {
        const active = value === r.key;
        return (
          <Pressable
            key={r.key}
            onPress={() => onChange(active ? null : r.key)}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{r.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.cyan,
  },
  btnActive: {
    backgroundColor: colors.cyan,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.cyan,
  },
  textActive: {
    color: "#fff",
  },
});
