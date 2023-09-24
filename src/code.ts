import { convertIntoNodes } from "./altNodes/altConversion";
import { bootstrapMain } from "./bootstrap/bootstrapMain";
import format from "html-format";

export type FrameworkTypes = "Bootstrap";

export type PluginSettings = {
  framework: FrameworkTypes;
  jsx: boolean;
  inlineStyle: boolean;
  optimizeLayout: boolean;
  layerName: boolean;
  responsiveRoot: boolean;
  roundBootstrap: boolean;
};

export const run = (settings: PluginSettings) => {
  if (figma.currentPage.selection.length === 0) {
    return;
  }

  const convertedSelection = convertIntoNodes(
    figma.currentPage.selection,
    null
  );

  let bootstrapCode = bootstrapMain(convertedSelection, settings);

  let html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
		<title>Bootstrap Code Preview</title>
    <style>
      div {
        border: 1px solid red;
        min-height: 50px;
		min-width: 50px;
      }
    </style>
	</head>
    <body>
		<script>
			function copyToClipboard(type) {
				const codeElement = document.querySelector('main');
				if (codeElement) {
					const code = type == 'html' ? document.documentElement.outerHTML : codeElement.outerHTML;
					const textArea = document.createElement('textarea');
					textArea.value = code;
					document.body.appendChild(textArea);
					textArea.select();
					document.execCommand('copy');
					document.body.removeChild(textArea);
					alert('Code copied to clipboard!');
				}
			}
		</script>

		<div class="row d-flex justify-content-center">
			<button class="btn btn-primary" onclick="copyToClipboard('html')">Copy Full HTML</button>
			<button class="btn btn-primary" onclick="copyToClipboard('layer')">Copy Layer Code</button>
		</div>
		<main>
			${bootstrapCode}
		</main>
    </body>
	</html>`;
  figma.showUI(html);
};
