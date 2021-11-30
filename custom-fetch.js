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
    timeout
  } = {},
) {
  const headers = { 'Content-Type': 'application/json' };
  let timeoutSignal = undefined;
  if (timeout) {
    timeoutSignal = createTimeoutSignal(AbortController, timeout);
  }
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    }
  }
  if (body && config.headers['Content-Type'] === 'application/json') {
    config.body = JSON.stringify(body);
  } else {
    config.body = body;
  }
  if (timeoutSignal) {
    config.signal = timeoutSignal.signal;
  }
  return fetch(endpoint, config).then(async (response) => {
    if (timeoutSignal) {
      timeoutSignal.clear();
    }
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.indexOf('application/json') > -1) {
      return await response.json()
    } else if (response.ok) {
      return await response.text();
    } else {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
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
