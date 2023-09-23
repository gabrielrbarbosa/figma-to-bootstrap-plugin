import { pxToLayoutSize } from "../conversionTables";

type PaddingType =
  | { all: number }
  | {
      horizontal: number;
      vertical: number;
    }
  | {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };

export const commonPadding = (
  node: InferredAutoLayoutResult
): PaddingType | null => {
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    const paddingLeft = parseFloat((node.paddingLeft ?? 0).toFixed(2));
    const paddingRight = parseFloat((node.paddingRight ?? 0).toFixed(2));
    const paddingTop = parseFloat((node.paddingTop ?? 0).toFixed(2));
    const paddingBottom = parseFloat((node.paddingBottom ?? 0).toFixed(2));

    if (
      paddingLeft === paddingRight &&
      paddingLeft === paddingBottom &&
      paddingTop === paddingBottom
    ) {
      return { all: paddingLeft };
    } else if (paddingLeft === paddingRight && paddingTop === paddingBottom) {
      return {
        horizontal: paddingLeft,
        vertical: paddingTop,
      };
    } else {
      return {
        left: paddingLeft,
        right: paddingRight,
        top: paddingTop,
        bottom: paddingBottom,
      };
    }
  }

  return null;
};


/**
 * https://getbootstrap.com/docs/5.3/utilities/spacing/#margin-and-padding
 * example: px-2 py-8
 */
export const bootstrapPadding = (node: InferredAutoLayoutResult): string[] => {
  const padding = commonPadding(node);
  if (!padding) {
    return [];
  }

  if ("all" in padding) {
    if (padding.all === 0) {
      return [];
    }
    return [`p-${pxToLayoutSize(padding.all)}`];
  }

  let comp: string[] = [];

  if ("horizontal" in padding) {
    // horizontal and vertical, as the default AutoLayout
    if (padding.horizontal && padding.horizontal !== 0) {
      comp.push(`px-${pxToLayoutSize(padding.horizontal)}`);
    }
    if (padding.vertical && padding.vertical !== 0) {
      comp.push(`py-${pxToLayoutSize(padding.vertical)}`);
    }
    return comp;
  }

  // if left and right exists, verify if they are the same after [pxToLayoutSize] conversion.
  const { left, right, top, bottom } = padding;

  if (left || right) {
    const pl = left ? `ps-${pxToLayoutSize(left)}` : "";
    const pr = right ? `pe-${pxToLayoutSize(right)}` : "";
    comp.push(
      ...(left && right && pxToLayoutSize(left) === pxToLayoutSize(right)
        ? [`px-${pxToLayoutSize(left)}`]
        : [pl, pr])
    );
  }

  if (top || bottom) {
    const pt = top ? `pt-${pxToLayoutSize(top)}` : "";
    const pb = bottom ? `pb-${pxToLayoutSize(bottom)}` : "";
    comp.push(
      ...(top && bottom && pxToLayoutSize(top) === pxToLayoutSize(bottom)
        ? [`py-${pxToLayoutSize(top)}`]
        : [pt, pb])
    );
  }

  return comp;
};