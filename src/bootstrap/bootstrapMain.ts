import { BootstrapTextBuilder } from "./bootstrapTextBuilder";
import { BootstrapBuilder } from "./bootstrapBuilder";
import { PluginSettings } from "../code";
import { bootstrapAutoLayoutProps } from "./builderImpl/bootstrapAutoLayout";

export let localBootstrapSettings: PluginSettings;

let previousExecutionCache: { style: string; text: string }[];

const selfClosingTags = ["img"];

export const retrieveTopFill = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): Paint | undefined => {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    // on Figma, the top layer is always at the last position
    // reverse, then try to find the first layer that is visible, if any.
    return [...fills].reverse().find((d) => d.visible !== false);
  }
};

export const indentString = (str: string, indentLevel: number = 2): string => {
  // const options = {
  //   includeEmptyLines: false,
  // };

  // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  const regex = /^(?!\s*$)/gm;
  return str.replace(regex, " ".repeat(indentLevel));
};

export const bootstrapVector = (
  node: FrameNode | GroupNode,
  showLayerName: boolean,
  parentId: string,
  isJsx: boolean
): string => {
  // TODO VECTOR
  return "";
};

export const commonSortChildrenWhenInferredAutoLayout = (
  node: SceneNode & ChildrenMixin,
  optimize: boolean
) => {
  if (node.children.length <= 1) {
    return node.children;
  }

  if (
    optimize &&
    "inferredAutoLayout" in node &&
    node.inferredAutoLayout !== null
  ) {
    const children = [...node.children];
    switch (node.inferredAutoLayout.layoutMode) {
      case "HORIZONTAL":
        return children.sort((a, b) => a.x - b.x);
      // NONE is a bug from Figma.
      case "NONE":
      case "VERTICAL":
        console.log(
          "ordering",
          children.map((c) => c.name),
          children.sort((a, b) => a.y - b.y).map((c) => c.name)
        );
        return children.sort((a, b) => a.y - b.y);
    }
  }
  return node.children;
};


export const bootstrapMain = (
  sceneNode: Array<SceneNode>,
  settings: PluginSettings
): string => {
  localBootstrapSettings = settings;
  previousExecutionCache = [];

  let result = bootstrapWidgetGenerator(sceneNode, localBootstrapSettings.jsx);

  // remove the initial \n that is made in Container.
  if (result.length > 0 && result.startsWith("\n")) {
    result = result.slice(1, result.length);
  }

  return result;
};

// todo lint idea: replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const bootstrapWidgetGenerator = (
  sceneNode: ReadonlyArray<SceneNode>,
  isJsx: boolean
): string => {
  let comp = "";

  // filter non visible nodes. This is necessary at this step because conversion already happened.
  const visibleSceneNode = sceneNode.filter((d) => d.visible);
  visibleSceneNode.forEach((node) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
        comp += bootstrapContainer(node, "", "", isJsx);
        break;
      case "GROUP":
        comp += bootstrapGroup(node, isJsx);
        break;
      case "FRAME":
      case "COMPONENT":
      case "INSTANCE":
      case "COMPONENT_SET":
        comp += bootstrapFrame(node, isJsx);
        break;
      case "TEXT":
        comp += bootstrapText(node, isJsx);
        break;
      case "LINE":
        comp += bootstrapLine(node, isJsx);
        break;
      case "SECTION":
        comp += bootstrapSection(node, isJsx);
        break;
      // case "VECTOR":
      //   comp += htmlAsset(node, isJsx);
    }
  });

  return comp;
};

const bootstrapGroup = (node: GroupNode, isJsx: boolean = false): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  // also ignore if there are no children inside, which makes no sense
  if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
    return "";
  }

  const vectorIfExists = bootstrapVector(
    node,
    localBootstrapSettings.layerName,
    "",
    isJsx
  );
  if (vectorIfExists) return vectorIfExists;

  // this needs to be called after CustomNode because widthHeight depends on it
  const builder = new BootstrapBuilder(
    node,
    localBootstrapSettings.layerName,
    isJsx
  )
    .blend(node)
    .size(node, localBootstrapSettings.optimizeLayout)
    .position(node, localBootstrapSettings.optimizeLayout);

  if (builder.attributes || builder.style) {
    const attr = builder.build("");

    const generator = bootstrapWidgetGenerator(node.children, isJsx);

    return `\n<div${attr}>${indentString(generator)}\n</div>`;
  }

  return bootstrapWidgetGenerator(node.children, isJsx);
};

export const bootstrapText = (node: TextNode, isJsx: boolean): string => {
  let layoutBuilder = new BootstrapTextBuilder(
    node,
    localBootstrapSettings.layerName,
    isJsx
  )
    .commonPositionStyles(node, localBootstrapSettings.optimizeLayout)
    .textAlign(node);

  const styledHtml = layoutBuilder.getTextSegments(node.id);
  previousExecutionCache.push(...styledHtml);

  let content = "";
  if (styledHtml.length === 1) {
    layoutBuilder.addAttributes(styledHtml[0].style);
    content = styledHtml[0].text;
  } else {
    content = styledHtml
      .map((style: { style: any; text: any; }) => `<span style="${style.style}">${style.text}</span>`)
      .join("");
  }

  return `\n<div${layoutBuilder.build()}>${content}</div>`;
};

const bootstrapFrame = (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  isJsx: boolean
): string => {
  const childrenStr = bootstrapWidgetGenerator(
    commonSortChildrenWhenInferredAutoLayout(
      node,
      localBootstrapSettings.optimizeLayout
    ),
    isJsx
  );

  if (node.layoutMode !== "NONE") {
    const rowColumn = bootstrapAutoLayoutProps(node, node);
    return bootstrapContainer(node, childrenStr, rowColumn, isJsx);
  } else {
    if (localBootstrapSettings.optimizeLayout && node.inferredAutoLayout !== null) {
      const rowColumn = bootstrapAutoLayoutProps(node, node.inferredAutoLayout);
      return bootstrapContainer(node, childrenStr, rowColumn, isJsx);
    }

    // node.layoutMode === "NONE" && node.children.length > 1
    // children needs to be absolute
    return bootstrapContainer(node, childrenStr, "", isJsx);
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const bootstrapContainer = (
  node: SceneNode &
    SceneNodeMixin &
    BlendMixin &
    LayoutMixin &
    GeometryMixin &
    MinimalBlendMixin,
  children: string,
  additionalAttr: string,
  isJsx: boolean
): string => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width < 0 || node.height < 0) {
    return children;
  }

  let builder = new BootstrapBuilder(node, localBootstrapSettings.layerName, isJsx)
    .commonPositionStyles(node, localBootstrapSettings.optimizeLayout)
    .commonShapeStyles(node);

  if (builder.attributes || additionalAttr) {
    const build = builder.build(additionalAttr);

    // image fill and no children -- let's emit an <img />
    let tag = "div";
    let src = "";
    if (retrieveTopFill(node.fills)?.type === "IMAGE") {
      if (!("children" in node) || node.children.length === 0) {
        tag = "img";
        src = ` src="https://via.placeholder.com/${node.width.toFixed(
          0
        )}x${node.height.toFixed(0)}"`;
      } else {
        builder.addAttributes(
          `bg-[url(https://via.placeholder.com/${node.width.toFixed(
            0
          )}x${node.height.toFixed(0)})]`
        );
      }
    }

    if (children) {
      return `\n<${tag}${build}${src}>${indentString(children)}\n</${tag}>`;
    } else if (selfClosingTags.includes(tag) || isJsx) {
      return `\n<${tag}${build}${src} />`;
    } else {
      return `\n<${tag}${build}${src}></${tag}>`;
    }
  }

  return children;
};

export const bootstrapLine = (node: LineNode, isJsx: boolean): string => {
  const builder = new BootstrapBuilder(
    node,
    localBootstrapSettings.layerName,
    isJsx
  )
    .commonPositionStyles(node, localBootstrapSettings.optimizeLayout)
    .commonShapeStyles(node);

  return `\n<div${builder.build()}></div>`;
};

export const bootstrapSection = (node: SectionNode, isJsx: boolean): string => {
  const childrenStr = bootstrapWidgetGenerator(node.children, isJsx);
  const builder = new BootstrapBuilder(
    node,
    localBootstrapSettings.layerName,
    isJsx
  )
    .size(node, localBootstrapSettings.optimizeLayout)
    .position(node, localBootstrapSettings.optimizeLayout)
    .customColor(node.fills, "bg");

  if (childrenStr) {
    return `\n<div${builder.build()}>${indentString(childrenStr)}\n</div>`;
  } else {
    return `\n<div${builder.build()}></div>`;
  }
};

export const bootstrapCodeGenTextStyles = () => {
  const result = previousExecutionCache
    .map((style) => `// ${style.text}\n${style.style.split(" ").join("\n")}`)
    .join("\n---\n");

  if (!result) {
    return "// No text styles in this selection";
  }

  return result;
};