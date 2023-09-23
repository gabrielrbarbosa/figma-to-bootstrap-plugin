import format from "html-format";

export default function () {
	function generateBootstrapGrid(node: SceneNode) {
		let code = "";
		
		if (node.type === 'FRAME' || node.type === 'GROUP') {
			code += `\n<div class="row">`;
			for (const child of node.children) {
				const colSize = Math.round(child.width / node.width * 12);

				code += `<div class="col-${colSize}">\n`;
				code += generateBootstrapGrid(child);
				code += `</div>\n`;
			}
			code += `</div>\n`;
		} else {
			code += `${node.type}`;
		}
		
		return code;
	}
	
	const selectedNodes = figma.currentPage.selection;
	let bootstrapCode = "";
	for (const node of selectedNodes) {
		bootstrapCode += generateBootstrapGrid(node);
	}
	bootstrapCode = format(bootstrapCode);

	console.log(bootstrapCode);
	
	const uiHTML = `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
		<title>Bootstrap Code Preview</title>
	</head>
	<style>
		div {
			border: 1px solid red;
			min-height: 50px;
		}
	</style>
	<body>
		${bootstrapCode}
		<div id="codeContainer"></div>
	</body>
	</html>
	`;

	figma.showUI(uiHTML, { width: 1200, height: 1200 });
}