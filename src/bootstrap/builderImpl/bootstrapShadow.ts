/**
 * https://getbootstrap.com/docs/5.3/utilities/shadows/
 * example: shadow
 */
export const bootstrapShadow = (node: BlendMixin): string[] => {
    if (node.effects && node.effects.length > 0) {
      const dropShadow = node.effects.filter(
        (d) => d.type === "DROP_SHADOW" && d.visible
      );
      let boxShadow = "";
      if (dropShadow.length > 0) {
        boxShadow = "shadow";
      }
      return [boxShadow];
    }
    return [];
  };