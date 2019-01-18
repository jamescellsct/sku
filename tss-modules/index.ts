import md5 from 'md5';

import * as CSS from 'csstype';

type CSSProperties = CSS.PropertiesFallback<string | number>;

interface SelectorMap {
  [selector: string]: CSSProperties;
}

type LocalStyles = {
  [classIdentifier: string]: CSSProperties | [CSSProperties, SelectorMap];
};
export default <Styles extends LocalStyles>(
  styles: Styles,
  globalStyles: SelectorMap = {}
): { [K in keyof Styles]: string } => {
  const localStyles = Object.keys(styles).reduce((acc, className) => {
    const value = styles[className];
    const [mainStyles, nestedStyles] =
      value instanceof Array ? value : [value, {}];

    return {
      ...acc,
      [`.${className}`]: { ...mainStyles, ...nestedStyles }
    };
  }, {});

  const allStyles = { ':global': globalStyles, ...localStyles };

  const stylesheetHash = md5(JSON.stringify(allStyles)).slice(0, 5);

  const mockCssModule = Object.assign(
    {},
    ...Object.keys(localStyles).map(className => ({
      [className]: `${className}__${stylesheetHash}`
    }))
  );

  return Object.defineProperty(mockCssModule, '__css', {
    value: allStyles,
    enumerable: false,
    writable: false
  });
};
