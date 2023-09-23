import { className, sliceNum } from "../common/numToAutoFixed";
import { bootstrapShadow } from "./builderImpl/bootstrapShadow";
import {
  bootstrapVisibility,
  bootstrapOpacity,
} from "./builderImpl/bootstrapBlend";
import {
  bootstrapColorFromFills,
  bootstrapGradientFromFills,
} from "./builderImpl/bootstrapColor";
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
      bootstrapRotation(node),
      bootstrapOpacity(node),
      bootstrapBlendMode(node)
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
    this.size(node, optimizeLayout);
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
    this.blur(node);
    return this;
  }

  radius(node: SceneNode): this {
    if (node.type === "ELLIPSE") {
      this.addAttributes("rounded-full");
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
      } else {
        this.addAttributes(`left-[${parsedX}px]`);
      }
      if (parsedY === "0") {
        this.addAttributes(`top-0`);
      } else {
        this.addAttributes(`top-[${parsedY}px]`);
      }

      this.addAttributes(`absolute`);
    } else if (
      node.type === "GROUP" ||
      ("layoutMode" in node &&
        ((optimizeLayout ? node.inferredAutoLayout : null) ?? node)
          ?.layoutMode === "NONE")
    ) {
      this.addAttributes("relative");
    }
    return this;
  }

  /**
   * https://bootstrapcss.com/docs/text-color/
   * example: text-blue-500
   * example: text-opacity-25
   * example: bg-blue-500
   */
  customColor(
    paint: ReadonlyArray<Paint> | PluginAPI["mixed"],
    kind: string
  ): this {
    // visible is true or undefinied (tests)
    if (this.visible) {
      let gradient = "";
      if (kind === "bg") {
        gradient = bootstrapGradientFromFills(paint);
      }
      if (gradient) {
        this.addAttributes(gradient);
      } else {
        this.addAttributes(bootstrapColorFromFills(paint, kind));
      }
    }
    return this;
  }

  /**
   * https://bootstrapcss.com/docs/box-shadow/
   * example: shadow
   */
  shadow(node: BlendMixin): this {
    this.addAttributes(...bootstrapShadow(node));
    return this;
  }

  // must be called before Position, because of the hasFixedSize attribute.
  size(node: SceneNode, optimizeLayout: boolean): this {
    const { width, height } = bootstrapSizePartial(node, optimizeLayout);

    if (node.type === "TEXT") {
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          break;
        case "HEIGHT":
          this.addAttributes(width);
          break;
        case "NONE":
        case "TRUNCATE":
          this.addAttributes(width, height);
          break;
      }
    } else {
      this.addAttributes(width, height);
    }

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

  blur(node: SceneNode) {
    if ("effects" in node && node.effects.length > 0) {
      const blur = node.effects.find((e) => e.type === "LAYER_BLUR");
      if (blur) {
        const blurValue = pxToBlur(blur.radius);
        if (blurValue) {
          this.addAttributes(`blur${blurValue ? `-${blurValue}` : ""}`);
        }
      }

      const backgroundBlur = node.effects.find(
        (e) => e.type === "BACKGROUND_BLUR"
      );
      if (backgroundBlur) {
        const backgroundBlurValue = pxToBlur(backgroundBlur.radius);
        if (backgroundBlurValue) {
          this.addAttributes(
            `backdrop-blur${
              backgroundBlurValue ? `-${backgroundBlurValue}` : ""
            }`
          );
        }
      }
    }
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
