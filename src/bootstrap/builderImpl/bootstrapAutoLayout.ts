import { pxToLayoutSize } from "../conversionTables";

const getFlexDirection = (node: InferredAutoLayoutResult): string =>
  node.layoutMode === "HORIZONTAL" ? "" : "flex-column";

const getJustifyContent = (node: InferredAutoLayoutResult): string => {
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return "justify-content-start";
    case "CENTER":
      return "justify-content-center";
    case "MAX":
      return "justify-content-end";
    case "SPACE_BETWEEN":
      return "justify-content-between";
  }
};

const getAlignItems = (node: InferredAutoLayoutResult): string => {
  switch (node.counterAxisAlignItems) {
    case "MIN":
      return "align-items-start";
    case "CENTER":
      return "align-items-center";
    case "MAX":
      return "align-items-end";
    case "BASELINE":
      return "align-items-baseline";
  }
};

const getGap = (node: InferredAutoLayoutResult): string =>
  node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN"
    ? `gap-${pxToLayoutSize(node.itemSpacing)}`
    : "";

const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "flex"
    : "inline-flex";

export const bootstrapAutoLayoutProps = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult
): string =>
  Object.values({
    flexDirection: getFlexDirection(autoLayout),
    justifyContent: getJustifyContent(autoLayout),
    alignItems: getAlignItems(autoLayout),
    gap: getGap(autoLayout),
    flex: getFlex(node, autoLayout),
  })
    .filter((value) => value !== "")
    .join(" ");