import { fetch } from 'meteor/fetch';
import { URL, URLSearchParams } from 'meteor/url';
import HTTPCommon from './httpcall_common';

class HTTPServer extends HTTPCommon {
  static async call(method, url, options = {}) {
    if (!/^https?:\/\//.test(url)) {
      throw new Error('URL must be absolute and start with http:// or https://');
    }

    method = (method || '').toUpperCase();

    const headers = {};
    let content = options.content;

    if (options.data) {
      content = JSON.stringify(options.data);
      headers['Content-Type'] = 'application/json';
    }

    let paramsForBody;
    if (!(content || method === 'GET' || method === 'HEAD')) {
      paramsForBody = options.params;
    }

    const newUrl = new URL(url);

    if (options.auth) {
      const base64 = Buffer.from(options.auth, 'ascii').toString('base64');
      headers['Authorization'] = `Basic ${base64}`;
    }

    if (paramsForBody) {
      const data = new URLSearchParams();
      for (const [key, value] of Object.entries(paramsForBody)) {
        data.append(key, value);
      }
      content = data.toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers[key] = value;
      }
    }

    const requestOptions = {
      method,
      body: content !== undefined ? content : null,
      headers,
      redirect: options.followRedirects === false ? 'manual' : 'follow',
    };

    try {
      const response = await fetch(newUrl.toString(), requestOptions);
      const responseContent = await response.text();

      const httpResponse = {
        statusCode: response.status,
        content: responseContent,
        headers: {}
      };

      this.setRequestHeaders(httpResponse.headers, response);

      this.populateData(httpResponse);

      return httpResponse;
    } catch (error) {
      throw error;
    }
  }
}

export { HTTPServer as HTTP };
