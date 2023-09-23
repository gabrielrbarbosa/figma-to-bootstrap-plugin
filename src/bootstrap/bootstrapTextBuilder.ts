import { bootstrapColorFromFills } from "./builderImpl/bootstrapColor";
import { pxToFontSize } from "./conversionTables";
import { BootstrapBuilder } from "./bootstrapBuilder";

export class BootstrapTextBuilder extends BootstrapBuilder {
  getTextSegments(id: string): { style: string; text: string }[] {
    let globalTextStyleSegments: Record<string, StyledTextSegment[]> = {};
    const segments = globalTextStyleSegments[id];
    if (!segments) {
      return [];
    }

    return segments.map((segment: any) => {
      const color = this.getBootstrapColorFromFills(segment.fills);
      const textDecoration = this.textDecoration(segment.textDecoration);
      const textTransform = this.textTransform(segment.textCase);

      const styleClasses = [
        color,
        this.fontSize(segment.fontSize),
        this.fontWeight(segment.fontWeight),
        this.fontFamily(segment.fontName),
        textDecoration,
        textTransform,
      ]
        .filter((d) => d !== "")
        .join(" ");

      const charsWithLineBreak = segment.characters.split("\n").join("<br/>");
      return { style: styleClasses, text: charsWithLineBreak };
    });
  }

  getBootstrapColorFromFills = (
    fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
  ) => {
    return bootstrapColorFromFills(fills, "text");
  };

  fontSize = (fontSize: number) => {
    return `fs-${pxToFontSize(fontSize)}`;
  };

  fontWeight = (fontWeight: number): string => {
    switch (fontWeight) {
      case 100:
        return "fw-lighter";
      case 300:
        return "fw-light";
      case 400:
        return "fw-normal";
      case 500:
        return "fw-medium";
      case 600:
        return "fw-semibold";
      case 700:
        return "fw-bold";
      default:
        return "";
    }
  };

  indentStyle = (indentation: number) => {
    // Convert indentation to the appropriate Bootstrap CSS class.
    // This can be based on your project's configuration and spacing scale.
    // For example, suppose your project uses the default Bootstrap CSS spacing scale:
    return `pl-${Math.round(indentation)}`;
  };

  fontFamily = (fontName: FontName): string => {
    return "font-['" + fontName.family + "']";
  };

  /**
   * https://getbootstrap.com/docs/5.3/utilities/text/font-size/
   * example: text-md
   */
  // fontSize(fontSize: number): this {
  //   // example: text-md
  //   const value = pxToFontSize(fontSize);
  //   this.addAttributes(`text-${value}`);
  //   return this;
  // }

  /**
   * https://getbootstrap.com/docs/5.3/utilities/text/font-style/
   * example: font-extrabold
   * example: italic
   */
  fontStyle(node: TextNode): this {
    if (node.fontName !== figma.mixed) {
      const lowercaseStyle = node.fontName.style.toLowerCase();

      if (lowercaseStyle.match("italic")) {
        this.addAttributes("fst-italic");
      }

      if (lowercaseStyle.match("regular")) {
        // ignore the font-style when regular (default)
        return this;
      }

      const value = node.fontName.style
        .replace("italic", "")
        .replace(" ", "")
        .toLowerCase();

      this.addAttributes(`font-${value}`);
    }
    return this;
  }

  /**
   * https://getbootstrap.com/docs/5.3/utilities/text/#text-alignment
   * example: text-center
   */
  textAlign(node: TextNode): this {
    // if alignHorizontal is LEFT, don't do anything because that is native

    // only undefined in testing
    if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
      // todo when node.textAutoResize === "WIDTH_AND_HEIGHT" and there is no \n in the text, this can be ignored.
      switch (node.textAlignHorizontal) {
        case "CENTER":
          this.addAttributes(`text-center`);
          break;
        case "RIGHT":
          this.addAttributes(`text-end`);
          break;
        case "JUSTIFIED":
          this.addAttributes(`text-start`);
          break;
        default:
          break;
      }
    }

    return this;
  }

  /**
   * https://getbootstrap.com/docs/5.3/utilities/text/text-transform/
   * example: uppercase
   */
  textTransform(textCase: TextCase): string {
    switch (textCase) {
      case "UPPER":
        return "text-uppercase";
      case "LOWER":
        return "text-lowercase";
      case "TITLE":
        return "text-capitalize";
      case "ORIGINAL":
      case "SMALL_CAPS":
      case "SMALL_CAPS_FORCED":
      default:
        return "";
    }
  }

  /**
   * https://getbootstrap.com/docs/5.3/utilities/text/text-decoration/
   * example: underline
   */
  textDecoration(textDecoration: TextDecoration): string {
    switch (textDecoration) {
      case "STRIKETHROUGH":
        return "text-decoration-line-through";
      case "UNDERLINE":
        return "text-decoration-underline";
      case "NONE":
        return "text-decoration-none";
    }
  }

  reset(): void {
    this.attributes = [];
  }
}