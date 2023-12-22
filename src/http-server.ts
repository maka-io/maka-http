import { fetch } from 'meteor/fetch';
import { URL, URLSearchParams } from 'meteor/url';
import HTTPCommon from './http-common';


class HTTPServer extends HTTPCommon {
  static async call(method: string, url: string, options: ServerOptions = {}): Promise<HTTPResponse> {
    if (!/^https?:\/\//.test(url)) {
      throw new Error('URL must be absolute and start with http:// or https://');
    }

    method = method.toUpperCase();

    const headers: { [key: string]: string } = {};
    let content = options.content;

    if (options.data) {
      content = JSON.stringify(options.data);
      headers['Content-Type'] = 'application/json';
    }

    let paramsForBody: any;
    if (!(content || ['GET', 'HEAD'].includes(method))) {
      paramsForBody = options.params;
    }

    const newUrl = new URL(url);

    if (options.auth) {
      const base64 = Buffer.from(options.auth, 'ascii').toString('base64');
      headers['Authorization'] = `Basic ${base64}`;
    }

    if (paramsForBody) {
      const data = new URLSearchParams(paramsForBody);
      content = data.toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const requestOptions = {
      method,
      body: content,
      headers,
      redirect: options.followRedirects === false ? 'manual' : 'follow',
    };

    const response = await fetch(newUrl.toString(), requestOptions);
    const responseContent = await response.text();

    const httpResponse = {
      statusCode: response.status,
      content: responseContent,
      headers: {}
    };

    for (const [key, value] of response.headers.entries()) {
      httpResponse.headers[key] = value;
    }

    this.populateData(httpResponse);

    return httpResponse;
  }
}

export { HTTPServer as HTTP };
