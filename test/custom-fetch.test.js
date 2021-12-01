import assert from 'assert';
import sinon from 'sinon';
import nodeFetch from 'node-fetch';
import abortController from 'abort-controller';
import customFetch from '../custom-fetch.js';

const AbortController = globalThis.AbortController || abortController;

describe('custom-fetch', () => {
  it('calls fetch with given parameters', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: true,
      json: () => {}
    }));
    return customFetch('https://url', { my: 'options' }, { fetch }).then(() => {
      assert.equal(fetch.firstCall.args[0], 'https://url');
      assert.deepStrictEqual(fetch.firstCall.args[1], {
        method: 'GET',
        my: 'options'
      });
    });
  });

  it('JSON.stringifies given "body" when object and assign JSON content-type', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: true,
      json: () => {}
    }));
    return customFetch('https://url', {
      body: { my: 'object' }
    }, { fetch }).then(() => {
      assert.deepStrictEqual(fetch.firstCall.args[1], {
        method: 'POST',
        body: JSON.stringify({ my: 'object' }),
        headers: {
          'content-type': 'application/json'
        }
      });
    });
  });

  it('assigns body as is, when string', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: true,
      json: () => {}
    }));
    return customFetch('https://url', {
      body: 'my string'
    }, { fetch }).then(() => {
      assert.deepStrictEqual(fetch.firstCall.args[1], {
        method: 'POST',
        body: 'my string'
      });
    });
  });

  it('returns error when response is not ok', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: false,
      json: () => {},
      text: () => 'The server text response'
    }));
    return customFetch('https://url', {
      body: 'my string'
    }, { fetch }).then(() => {
      throw new Error('Should not be called!');
    }).catch((error) => {
      assert.deepStrictEqual(error.message, 'The server text response');
    });
  });

  it('returns all response non-function response properties and response of json() in data', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: true,
      other: 'prop',
      json: () => ({ my: 'result' })
    }));
    return customFetch('https://url', {}, { fetch }).then((result) => {
      assert.deepStrictEqual(result, {
        data: {
          my: 'result'
        },
        ok: true,
        other: 'prop'
      });
    })
  });

  it('parses response of json() in data', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: true,
      json: () => '{ "my": "result" }'
    }));
    return customFetch('https://url', {}, { fetch }).then((result) => {
      assert.deepStrictEqual(result, {
        data: {
          my: 'result'
        },
        ok: true
      });
    })
  });

  it('uses text() of response when "responseType" = "text"', () => {
    const fetch = sinon.stub().returns(Promise.resolve({
      ok: true,
      text: () => '{ "my": "result" }'
    }));
    return customFetch('https://url', {}, {
      fetch,
      responseType: 'text'
    }).then((result) => {
      assert.deepStrictEqual(result, {
        data: {
          my: 'result'
        },
        ok: true
      });
    })
  });

  it('times out after given 1ms timeout', () => {
    return customFetch('https://url', {
      body: 'my string'
    }, {
      fetch: nodeFetch,
      AbortController,
      timeout: 1
    }).then(() => {
      throw new Error('Should not be called!');
    }).catch((error) => {
      assert.deepStrictEqual(error.message, 'The user aborted a request.');
    });
  });
});