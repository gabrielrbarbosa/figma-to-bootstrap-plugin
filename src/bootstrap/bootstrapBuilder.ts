import { className, sliceNum } from "../common/numToAutoFixed";
import { commonIsAbsolutePosition, getCommonPositionValue } from "../common/position";
import { bootstrapShadow } from "./builderImpl/bootstrapShadow";
import { bootstrapBorderWidth, bootstrapBorderRadius } from "./builderImpl/bootstrapBorder";
import { bootstrapVisibility, bootstrapOpacity } from "./builderImpl/bootstrapBlend";
import { bootstrapColorFromFills } from "./builderImpl/bootstrapColor";
import { bootstrapPadding } from "./builderImpl/bootstrapPadding";

export class BootstrapBuilder {
  attributes: string[] = [];
  style: string;
  styleSeparator: string = "";
  isJSX: boolean;
  visible: boolean;
  name: string = "";

  constructor(node: SceneNode, showLayerName: boolean, optIsJSX: boolean) {
    this.isJSX = optIsJSX;
    this.styleSeparator = this.isJSX ? "," : ";";
    this.style = "";
    this.visible = node.visible;

    if (showLayerName) {
      this.attributes.push(className(node.name));
    }
  }

  addAttributes = (...newStyles: string[]) => {
    this.attributes.push(...newStyles.filter((style) => style !== ""));
  };

  blend(
    node: SceneNode & SceneNodeMixin & MinimalBlendMixin & LayoutMixin
  ): this {
    this.addAttributes(
      bootstrapVisibility(node),
      bootstrapOpacity(node)
    );

    return this;
  }

  commonPositionStyles(
    node: SceneNode &
      SceneNodeMixin &
      BlendMixin &
      LayoutMixin &
      MinimalBlendMixin,
    optimizeLayout: boolean
  ): this {
    this.autoLayoutPadding(node, optimizeLayout);
    this.position(node, optimizeLayout);
    this.blend(node);
    return this;
  }

  commonShapeStyles(node: GeometryMixin & BlendMixin & SceneNode): this {
    this.customColor(node.fills, "bg");
    this.radius(node);
    this.shadow(node);
    this.border(node);
    return this;
  }

  radius(node: SceneNode): this {
    if (node.type === "ELLIPSE") {
      this.addAttributes("rounded-circle");
    } else {
      this.addAttributes(bootstrapBorderRadius(node));
    }
    return this;
  }

  border(node: SceneNode): this {
    if ("strokes" in node) {
      this.addAttributes(bootstrapBorderWidth(node));
      this.customColor(node.strokes, "border");
    }

    return this;
  } 

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      const { x, y } = getCommonPositionValue(node);

      const parsedX = sliceNum(x);
      const parsedY = sliceNum(y);

      if (parsedX === "0") {
        this.addAttributes(`left-0`);
      } 

      if (parsedY === "0") {
        this.addAttributes(`top-0`);
      } 

      this.addAttributes(`position-absolute`);
    } else if (
      node.type === "GROUP" ||
      ("layoutMode" in node &&
        ((optimizeLayout ? node.inferredAutoLayout : null) ?? node)
          ?.layoutMode === "NONE")
    ) {
      this.addAttributes(`position-relative`);
    }
    return this;
  }

  /**
   * https://getbootstrap.com/docs/5.3/utilities/text/
   * example: text-white
   * example: bg-white
   */
  customColor(
    paint: ReadonlyArray<Paint> | PluginAPI["mixed"],
    kind: string
  ): this {
    // visible is true or undefinied (tests)
    if (this.visible) {
      let gradient = "";
      if (gradient) {
        this.addAttributes(gradient);
      } else {
        this.addAttributes(bootstrapColorFromFills(paint, kind));
      }
    }
    return this;
  }

  /**
   * https://getbootstrap.com/docs/5.3/utilities/shadows/#examples
   * example: shadow
   */
  shadow(node: BlendMixin): this {
    this.addAttributes(...bootstrapShadow(node));
    return this;
  }

  autoLayoutPadding(node: SceneNode, optimizeLayout: boolean): this {
    if ("paddingLeft" in node) {
      this.addAttributes(
        ...bootstrapPadding(
          (optimizeLayout ? node.inferredAutoLayout : null) ?? node
        )
      );
    }
    return this;
  }

  build(additionalAttr = ""): string {
    // this.attributes.unshift(this.name + additionalAttr);
    this.addAttributes(additionalAttr);

    if (this.style.length > 0) {
      this.style = ` style="${this.style}"`;
    }
    if (!this.attributes.length && !this.style) {
      return "";
    }
    const classOrClassName = this.isJSX ? "className" : "class";
    if (this.attributes.length === 0) {
      return "";
    }

    return ` ${classOrClassName}="${this.attributes.join(" ")}"${this.style}`;
  }

  reset(): void {
    this.attributes = [];
    this.style = "";
  }
}
