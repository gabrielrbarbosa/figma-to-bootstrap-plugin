import { convertIntoNodes } from "./altNodes/altConversion";
import { bootstrapMain } from "./bootstrap/bootstrapMain";

export type FrameworkTypes = "Flutter" | "SwiftUI" | "HTML" | "Bootstrap";

export type PluginSettings = {
  framework: FrameworkTypes;
  jsx: boolean;
  inlineStyle: boolean;
  optimizeLayout: boolean;
  layerName: boolean;
  responsiveRoot: boolean;
  flutterGenerationMode: string;
  swiftUIGenerationMode: string;
  roundBootstrap: boolean;
};

export const run = (settings: PluginSettings) => {
  // ignore when nothing was selected
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: "empty",
    });
    return;
  }

  const convertedSelection = convertIntoNodes(
    figma.currentPage.selection,
    null
  );
  let result = "";
  switch (settings.framework) {
    case "Bootstrap":
      result = bootstrapMain(convertedSelection, settings);
      break;
  }

  figma.ui.postMessage({
    type: "code",
    data: result,
    settings: settings,
    htmlPreview:
      convertedSelection.length > 0
        ? {
            size: convertedSelection.map((node) => ({
              width: node.width,
              height: node.height,
            }))[0],
            content: bootstrapMain(
              convertedSelection,
              {
                ...settings,
                jsx: false,
              },
            ),
          }
        : null,
    //colors: retrieveGenericSolidUIColors(settings.framework),
    //gradients: retrieveGenericGradients(settings.framework),
    preferences: settings,
    // text: retrieveBootstrapText(convertedSelection),
  });
};
