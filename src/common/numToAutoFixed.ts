// From https://github.com/sindresorhus/indent-string
export const indentString = (str: string, indentLevel: number = 2): string => {
  // const options = {
  //   includeEmptyLines: false,
  // };

  // const regex = options.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
  const regex = /^(?!\s*$)/gm;
  return str.replace(regex, " ".repeat(indentLevel));
};

// this is necessary to avoid a height of 4.999999523162842.
export const sliceNum = (num: number): string => {
  return num.toFixed(2).replace(/\.00$/, "");
};

export const printPropertyIfNotDefault = (
  propertyName: string,
  propertyValue: any,
  defaultProperty: any
): string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return `${propertyName}: ${propertyValue}`;
};

export const skipDefaultProperty = <T>(
  propertyValue: T,
  defaultProperty: T
): T | string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return propertyValue;
};

export const propertyIfNotDefault = (
  propertyValue: any,
  defaultProperty: any
): string => {
  if (propertyValue === defaultProperty) {
    return "";
  }
  return propertyValue;
};

type PropertyValueType = number | string | string[];

export const generateWidgetCode = (
  className: string,
  properties: Record<string, PropertyValueType>,
  positionedValues?: string[]
): string => {
  const propertiesArray = Object.entries(properties)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [\n${indentString(value.join(",\n"))},\n],`;
      } else {
        return `${key}: ${
          typeof value === "number" ? sliceNum(value) : value
        },`;
      }
    });

  const positionedValuesString = (positionedValues || [])
    .map((value) => {
      return typeof value === "number" ? sliceNum(value) : value;
    })
    .join(", ");

  const compactPropertiesArray = propertiesArray.join(" ");
  if (compactPropertiesArray.length < 40 && !positionedValues) {
    return `${className}(${compactPropertiesArray.slice(0, -1)})`;
  }

  const joined = `${positionedValuesString}${
    positionedValuesString ? ",\n" : ""
  }${propertiesArray.join("\n")}`;

  return `${className}(\n${indentString(joined.trim())}\n)`;
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const replaceAllUtil = (str: string, find: string, replace: string) =>
  str.replace(new RegExp(escapeRegExp(find), "g"), replace);

export function className(name: string): string {
  const words = name.split(/[^a-zA-Z0-9]+/);
  const camelCaseWords = words.map((word, index) => {
    if (index === 0) {
      const cleanedWord = word.replace(/^[^a-zA-Z]+/g, "");
      return (
        cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1).toLowerCase()
      );
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return camelCaseWords.join("");
}
