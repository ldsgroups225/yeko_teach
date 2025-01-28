import type { ViewStyle, TextStyle } from "react-native";

export type GeneralActivityIndicatorProps = {
  text?: string;
  size?: "small" | "large" | number;
  color?: string;
  containerStyle?: ViewStyle;
  indicatorStyle?: ViewStyle;
  textStyle?: TextStyle;
  useModal?: boolean;
  isVisible?: boolean;
  accessibilityLabel?: string;
};
