import { nearestValue } from "../conversionTables";

type BorderSideType =
  | { all: number }
  | {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };

export const commonStroke = (node: SceneNode, divideBy: number = 1): BorderSideType | null => {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
    return null;
  }

  if ("strokeTopWeight" in node) {
    if (
      node.strokeTopWeight === node.strokeBottomWeight &&
      node.strokeTopWeight === node.strokeLeftWeight &&
      node.strokeTopWeight === node.strokeRightWeight
    ) {
      return { all: node.strokeTopWeight / divideBy };
    }

    return {
      left: node.strokeLeftWeight / divideBy,
      top: node.strokeTopWeight / divideBy,
      right: node.strokeRightWeight / divideBy,
      bottom: node.strokeBottomWeight / divideBy,
    };
  } else if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
    return { all: node.strokeWeight / divideBy };
  }

  return null;
};


type RadiusType =
  | { all: number }
  | {
      topLeft: number;
      topRight: number;
      bottomRight: number;
      bottomLeft: number;
    };

export const getCommonRadius = (node: SceneNode): RadiusType => {
  if (
    "cornerRadius" in node &&
    node.cornerRadius !== figma.mixed &&
    node.cornerRadius
  ) {
    return { all: node.cornerRadius };
  }

  if ("topLeftRadius" in node) {
    if (
      node.topLeftRadius === node.topRightRadius &&
      node.topLeftRadius === node.bottomRightRadius &&
      node.topLeftRadius === node.bottomLeftRadius
    ) {
      return { all: node.topLeftRadius };
    }

    return {
      topLeft: node.topLeftRadius,
      topRight: node.topRightRadius,
      bottomRight: node.bottomRightRadius,
      bottomLeft: node.bottomLeftRadius,
    };
  }

  return { all: 0 };
};


/**
 * https://getbootstrap.com/docs/5.3/utilities/borders/#sizes
 * example: border-2
 */
export const bootstrapBorderWidth = (node: SceneNode): string => {
  const commonBorder = commonStroke(node);
  if (!commonBorder) {
    return "";
  }

  const getBorder = (weight: number, kind: string) => {
    if (weight >= 5) return 'border-5';
    if (weight >= 4) return 'border-4';
    if (weight >= 3) return 'border-3';
    if (weight >= 2) return 'border-2';
    if (weight >= 1) return 'border-1';
    return "";
  };

  if ("all" in commonBorder) {
    if (commonBorder.all === 0) {
      return "";
    }
    return getBorder(commonBorder.all, "");
  }

  const comp = [];
  if (commonBorder.left !== 0) {
    comp.push(getBorder(commonBorder.left, "-start"));
  }
  if (commonBorder.right !== 0) {
    comp.push(getBorder(commonBorder.right, "-end"));
  }
  if (commonBorder.top !== 0) {
    comp.push(getBorder(commonBorder.top, "-top"));
  }
  if (commonBorder.bottom !== 0) {
    comp.push(getBorder(commonBorder.bottom, "-bottom"));
  }
  return comp.join(" ");
};


/**
 * https://getbootstrap.com/docs/5.3/utilities/borders/#radius
 * example: rounded-sm
 * example: rounded-tr-lg
 */
export const bootstrapBorderRadius = (node: SceneNode): string => {
  if (node.type === "ELLIPSE") {
    return "rounded-circle";
  }

  const getRadius = (radius: number) => {
    if (radius >= 32) return '-5';
    if (radius >= 16) return '-4';
    if (radius >= 8) return '-3';
    if (radius >= 6) return '-2';
    if (radius >= 1) return '-1';
    return "";
  };

  const radius = getCommonRadius(node);

  if ("all" in radius) {
    if (radius.all === 0) {
      return "";
    } else if (radius.all > 999 && node.width < 1000 && node.height < 1000) {
      return "rounded-circle";
    }

    return `rounded${getRadius(radius.all)}`;
  }

  let comp: string[] = [];
  if (radius.topLeft !== 0) {
    comp.push(`rounded-top-${getRadius(radius.topLeft)}`);
  }
  if (radius.topRight !== 0) {
    comp.push(`rounded-top-${getRadius(radius.topRight)}`);
  }
  if (radius.bottomLeft !== 0) {
    comp.push(`rounded-bottom-${getRadius(radius.bottomLeft)}`);
  }
  if (radius.bottomRight !== 0) {
    comp.push(`rounded-bottom-${getRadius(radius.bottomRight)}`);
  }

  return comp.join(" ");
};
