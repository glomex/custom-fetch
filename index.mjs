import fetch from 'node-fetch';
import abortController from 'abort-controller';

import customFetch from './custom-fetch';

export default function(endpoint, config, options = {}) {
  return customFetch(endpoint, config, {
    ...options,
    fetch,
    AbortController: globalThis.AbortController || abortController
  });
}
