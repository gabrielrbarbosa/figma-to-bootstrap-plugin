import { pxToLayoutSize } from "../conversionTables";

const getFlexDirection = (node: InferredAutoLayoutResult): string =>
  node.layoutMode === "HORIZONTAL" || node.layoutPositioning === "AUTO"  ? "" : "flex-column";

const getJustifyContent = (node: InferredAutoLayoutResult): string => {
  switch (node.primaryAxisAlignItems) {
    case "MIN":
      return "";
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
      return "";
    case "CENTER":
      return "align-items-center";
    case "MAX":
      return "align-items-end";
    case "BASELINE":
      return "align-items-baseline";
  }
};

const getFlex = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult
): string =>
  node.parent &&
  "layoutMode" in node.parent &&
  node.parent.layoutMode === autoLayout.layoutMode
    ? "d-flex"
    : "";

export const bootstrapAutoLayoutProps = (
  node: SceneNode,
  autoLayout: InferredAutoLayoutResult
): string =>
  Object.values({
    flexDirection: getFlexDirection(autoLayout),
    justifyContent: getJustifyContent(autoLayout),
    alignItems: getAlignItems(autoLayout),
    flex: getFlex(node, autoLayout),
  })
    .filter((value) => value !== "")
    .join(" ");