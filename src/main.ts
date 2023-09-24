export type { PluginSettings } from "./code";
export { bootstrapMain } from "./bootstrap/bootstrapMain";
export { convertIntoNodes } from "./altNodes/altConversion";
import { run } from "./code";

export default function() {
    run({
        framework: "Bootstrap",
        jsx: false,
        inlineStyle: false,
        optimizeLayout: true,
        layerName: false,
        responsiveRoot: true,
        roundBootstrap: true
    });
}