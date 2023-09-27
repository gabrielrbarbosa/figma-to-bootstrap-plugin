import { convertIntoNodes } from "./altNodes/altConversion";
import { bootstrapMain } from "./bootstrap/bootstrapMain";
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
    figma.showUI('<p>No layer selected, please try again!</p>', {width:768, height: 768});
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
          /*border: 1px solid red;*/
          /*min-height: 50px;*/
          /*min-width: 50px;*/
        }
      </style>
    </head>
    <body>
      <script>
      function formatHTML(html) {
        let formatted = '';
        let indent = 0;
        const lines = html.split(/(?=<)|(?<=>)/);
        let insideTagText = '';  // To store the text inside a tag
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;  // Skip empty lines
          
          // Handle text within tags
          if (!trimmedLine.startsWith('<') && !trimmedLine.endsWith('>')) {
            insideTagText += trimmedLine;
            continue;
          }
          
          // Deduce indentation for closing tags
          if (trimmedLine.startsWith('</')) {
            indent--;
          }
          
          // Concatenate text inside tags before adding to the formatted string
          const contentLine = insideTagText ? '    '.repeat(indent) + insideTagText : '';
          if (contentLine) {
            formatted += contentLine + '\\n';
            insideTagText = '';
          }
          
          // Add the line with the correct indentation
          formatted += '    '.repeat(indent) + trimmedLine;
          if (trimmedLine.endsWith('>') && !trimmedLine.endsWith('/>')) {
            formatted += '\\n';
          }
          
          // Increment indentation for opening tags
          if (trimmedLine.endsWith('>') && !trimmedLine.startsWith('</') && !trimmedLine.endsWith('/>')) {
            indent++;
          }
        }
        
        formatted = formatted.split('\\n')
        .filter(line => line.trim())
        .map(line => line.includes('>') ? line.replace(/\s+>/, '>').replace(/>\\s+/, '>') : line)
        .join('\\n');
        return formatted;
      }
      
      function copyToClipboard(type) {
        const codeElement = document.querySelector('#component');
        if (codeElement) {
          let code = codeElement.outerHTML;
          if (type === 'html') {
            let clonedDoc = document.documentElement.cloneNode(true);
            
            // Remove the actions element from the cloned document
            let actionsElement = clonedDoc.querySelector('#actions');
            if (actionsElement) {
              actionsElement.remove();
            }
            
            // Remove the script element from the cloned document
            let scriptElements = clonedDoc.querySelectorAll('script');
            scriptElements.forEach(script => {
              script.remove();
            });
            
            clonedDoc.querySelector('head').outerHTML = 
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">' +
            '<title>Bootstrap Code Preview</title>' +
            '</head>';
            code = clonedDoc.outerHTML;
          }
          code = formatHTML(code);
          
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
      
      <div class="d-flex justify-content-center" id="actions">
        <div class="col-sm-6 p-0">
          <button class="btn btn-success w-100 rounded-0" onclick="copyToClipboard('html')">Copy Full HTML</button>
        </div>
        <div class="col-sm-6 p-0">
          <button class="btn btn-primary w-100 rounded-0" onclick="copyToClipboard('layer')">Copy Layer Code</button>
        </div>
      </div>
      <div id="component" class="container-fluid py-3">
        ${bootstrapCode}
      </div>
    </body>
    </html>`;
    figma.showUI(html, {width: 768, height: 500});
  };
  