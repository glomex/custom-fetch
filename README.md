# @glomex/custom-fetch

A convenience wrapper for fetch, which can be used in node and in the browser.

### It handles the following things:

- Automatically assumes that `Content-Type': application/json` is used, when body is given (encodes body with `JSON.stringify` and automatically resolves the JSON response)
- Allows to pass a timeout

### Usage

#### Node

It ensures to load `node-fetch` and `abort-controller` as necessary.

```js
const fetch = require('@glomex/custom-fetch');
fetch(
  'https://my-endpoint',
  // also see https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
  { method: 'GET' },
  { timeout: 5000 }
);
```

#### Browser

```js
import fetch from 'https://unpkg.com/@glomex/custom-fetch@1/dist/custom-fetch.modern.js';
fetch(
  'https://my-endpoint',
  // also see https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
  { method: 'GET' },
  { timeout: 5000, responseType: 'json' }
);
```

## License

[Apache 2.0 License](https://oss.ninja/apache-2.0-header/glomex)
