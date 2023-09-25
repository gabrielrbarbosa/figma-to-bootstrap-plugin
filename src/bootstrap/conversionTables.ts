import { sliceNum } from "../common/numToAutoFixed";
import { localBootstrapSettings } from "./bootstrapMain";

export const nearestValue = (goal: number, array: Array<number>): number => {
  return array.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
};

export const exactValue = (
  goal: number,
  array: Array<number>
): number | null => {
  for (let i = 0; i < array.length; i++) {
    const diff = Math.abs(goal - array[i]);

    if (diff <= 0.05) {
      return array[i];
    }
  }

  return null;
};

/**
 * convert pixel values to Bootstrap attributes.
 * by default, Bootstrap uses rem, while Figma uses px.
 * Therefore, a conversion is necessary. Rem = Pixel / 16.abs
 * Then, find in the corresponding table the closest value.
 */
const pxToRemToBootstrap = (
  value: number,
  conversionMap: Record<number, string>
): string => {
  const keys = Object.keys(conversionMap).map((d) => +d);
  const convertedValue = exactValue(value / 16, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localBootstrapSettings.roundBootstrap) {
    return conversionMap[nearestValue(value / 16, keys)];
  }

  return `${sliceNum(value)}`;
};

const pxToBootstrap = (
  value: number,
  conversionMap: Record<number, string>
): string | null => {
  const keys = Object.keys(conversionMap).map((d) => +d);
  const convertedValue = exactValue(value, keys);

  if (convertedValue) {
    return conversionMap[convertedValue];
  } else if (localBootstrapSettings.roundBootstrap) {
    return conversionMap[nearestValue(value, keys)];
  }

  return `${sliceNum(value)}`;
};

const mapFontSize: Record<number, string> = {
  0.75: "xs",
  0.875: "sm",
  1: "base",
  1.125: "lg",
  1.25: "xl",
  1.5: "xxl",
};

const mapBorderRadius: Record<number, string> = {
  // 0: "none",
  0.125: "sm",
  0.25: "",
  0.375: "md",
  0.5: "lg",
  0.75: "xl",
  1.0: "xxl",
};

// This uses pixels.
const mapBlur: Record<number, string> = {
  0: "none",
  4: "sm",
  8: "",
  12: "md",
  16: "lg",
  24: "xl",
  40: "xxl",
};

const mapWidthHeightSize: Record<number, string> = {
  // '0: 0',
  1: "px",
  2: "0.5",
  4: "1"
};

export const opacityValues = [ 10, 25, 50, 75, 100 ];

export const nearestOpacity = (nodeOpacity: number): number =>
  nearestValue(nodeOpacity * 100, opacityValues);

export const pxToFontSize = (value: number): string =>
  pxToRemToBootstrap(value, mapFontSize);

export const pxToLayoutSize = (value: number): string => {
  const bootstrapValue = pxToBootstrap(value, mapWidthHeightSize);
  if (bootstrapValue) {
    return bootstrapValue;
  }

  return `${sliceNum(value)}`;
};
