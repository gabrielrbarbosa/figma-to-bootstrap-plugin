import { nearestOpacity } from "../conversionTables";

/**
 * https://getbootstrap.com/docs/5.3/utilities/opacity/
 * default is [0, 25, 50, 75, 100], but '100' will be ignored:
 * if opacity was changed, let it be visible. Therefore, 98% => 75
 * node.opacity is between [0, 1]; output will be [0, 100]
 */
export const bootstrapOpacity = (node: MinimalBlendMixin): string => {
  // [when testing] node.opacity can be undefined
  if (node.opacity !== undefined && node.opacity !== 1) {
    return `opacity-${nearestOpacity(node.opacity)}`;
  }
  return "";
};

/**
 * https://getbootstrap.com/docs/5.3/utilities/visibility/
 * example: invisible
 */
export const bootstrapVisibility = (node: SceneNodeMixin): string => {
    // [when testing] node.visible can be undefined
  
    // When something is invisible in Figma, it isn't gone. Groups can make use of it.
    // Therefore, instead of changing the visibility (which causes bugs in nested divs),
    // this plugin is going to ignore color and stroke
    if (node.visible !== undefined && !node.visible) {
      return "invisible";
    }
    return "";
  };