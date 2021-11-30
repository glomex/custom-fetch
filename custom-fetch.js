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
  let signal = undefined;
  if (timeout) {
    ({ signal } = createTimeoutSignal(AbortController, timeout));
  }
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    }
  }
  if (body) {
    config.body = JSON.stringify(body);
  }
  if (signal) {
    config.signal = signal;
  }

  return fetch(endpoint, config).then(async (response) => {
    timeoutSignal.clear(signal);
    if (response.ok) {
      return await response.json()
    } else {
      const errorMessage = await response.text()
      return Promise.reject(new Error(errorMessage))
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
