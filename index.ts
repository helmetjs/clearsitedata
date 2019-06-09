import { IncomingMessage, ServerResponse } from 'http';

type Directive = 'cache' | 'cookies' | 'storage' | 'executionContexts' | '*';

interface ClearSiteDataOptions {
  directives?: Directive[];
}

function getHeaderValueFromOptions (options: ClearSiteDataOptions) {
  const VALID_TYPES = new Set([
    'cache',
    'cookies',
    'storage',
    'executionContexts',
    '*',
  ]);

  const { directives = ['*'] } = options;

  if (!Array.isArray(directives)) {
    throw new Error('Clear-Site-Data directives must be an array.');
  } else if (directives.length === 0) {
    throw new Error('Clear-Site-Data directives cannot be an empty array.');
  }

  const directivesSet = new Set(directives);
  if (directivesSet.size !== directives.length) {
    throw new Error('Clear-Site-Data directives cannot contain duplicates.');
  } else if (directivesSet.has('*') && directives.length > 1) {
    throw new Error('Clear-Site-Data cannot contain "*" and other directives. Remove the other directives or "*".');
  }

  return directives.map((directive) => {
    if (!VALID_TYPES.has(directive)) {
      throw new Error(`${directive } is not a valid Clear-Site-Data directive.`);
    }
    return `"${ directive }"`;
  }).join(',');
}

export = function clearSiteData (options: ClearSiteDataOptions = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function clearSiteData (_req: IncomingMessage, res: ServerResponse, next: () => void) {
    res.setHeader('Clear-Site-Data', headerValue);
    next();
  };
}
