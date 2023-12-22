import HTTPCommon from "./http-common";
import {
  HTTPClient as IHTTPClient,
  HTTPCommon as IHTTPCommon
} from '@maka/types';

class HTTPClient extends HTTPCommon {
  static async call(method: string, url: string, options: IHTTPClient.Options = {}): Promise<IHTTPCommon.HTTPResponse> {
    method = method.toUpperCase();

    const headers: HeadersInit = new Headers(options.headers || {});
    let body: BodyInit | null = null;

    if (options.data) {
      body = JSON.stringify(options.data);
      headers.set('Content-Type', 'application/json');
    } else if (options.content) {
      body = options.content;
    }

    // Process paramsForUrl and paramsForBody
    if (options.params) {
      const params = new URLSearchParams(options.params);
      if (['GET', 'HEAD'].includes(method)) {
        url += '?' + params.toString();
      } else {
        body = params.toString();
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
      }
    }

    const fetchOptions: RequestInit = {
      method: method,
      headers: headers,
      body: body,
    };

    const response = await fetch(url, fetchOptions);
    const responseContent = await response.text();

    const httpResponse: IHTTPCommon.HTTPResponse = {
      statusCode: response.status,
      content: responseContent,
      headers: this.parseResponseHeaders(response.headers)
    };

    this.populateData(httpResponse);

    return httpResponse;
  }
}

export { HTTPClient as HTTP };

