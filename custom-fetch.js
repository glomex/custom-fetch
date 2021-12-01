import '@ungap/global-this';

export default function customFetch(
  endpoint,
  {
    body,
    ...customConfig
  } = {},
  {
    fetch = globalThis.fetch,
    AbortController = globalThis.AbortController,
    responseType = 'text',
    timeout
  } = {},
) {
  let timeoutSignal = undefined;
  if (timeout) {
    timeoutSignal = createTimeoutSignal(AbortController, timeout);
  }
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig
  }
  // from here: https://github.com/developit/redaxios/blob/ab73a298ba9849c59d670230a9d24fd7b329fb4d/src/index.js#L171
  if (body && typeof body === 'object' && typeof body.append !== 'function') {
    config.body = JSON.stringify(body);
    config.headers = {
      ...config.headers,
      'content-type': 'application/json'
    };
  } else if (body) {
    config.body = body;
  }
  if (timeoutSignal) {
    config.signal = timeoutSignal.signal;
  }
  return fetch(endpoint, config).then(async (response) => {
    if (timeoutSignal) {
      timeoutSignal.clear();
    }
    if (!response.ok) {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
    const result = {};
    // see https://github.com/developit/redaxios/blob/ab73a298ba9849c59d670230a9d24fd7b329fb4d/src/index.js#L204-L213
    for (const i in response) {
      if (typeof response[i] !== 'function') result[i] = response[i];
    }
    const data = await response[responseType]();
    result.data = data;
    try {
      // just in case we can parse the result
      result.data = JSON.parse(data);
    } catch(error) {
      // ignore
    }
    return result;
  });
}

function createTimeoutSignal(AbortController, timeout) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, timeout);
  return {
    signal: controller.signal,
    clear: () => {
      globalThis.clearTimeout(timeoutId);
    }
  };
}
