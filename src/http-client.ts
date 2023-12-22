import HTTPCommon from "./http-common";
import { HTTPClient as IHTTPClient, HTTPCommon as IHTTPCommon } from '@maka/types';

class HTTPClient extends HTTPCommon {
  static async call(method: string, url: string, options: IHTTPClient.Options = {}): Promise<IHTTPCommon.HTTPResponse> {
    // Process interceptors and set up headers and body
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(method, url, options);
      url = result.url;
      options = result.options;
    }

    options = options || {};
    options.headers = options.headers || {};
    method = method.toUpperCase();

    const headers: HeadersInit = new Headers(options.headers);
    let body: BodyInit | null = null;

    if (options.data) {
      body = JSON.stringify(options.data);
      headers.set('Content-Type', 'application/json');
    } else if (options.content) {
      body = options.content;
    }

    // Construct fetch options
    const fetchOptions: RequestInit = {
      method: method,
      headers: headers,
      body: body,
    };

    // Create the fetch promise
    const fetchPromise = fetch(url, fetchOptions).then(async response => {
      // Process the response
      const responseContent = await response.text();

      const httpResponse: IHTTPCommon.HTTPResponse = {
        statusCode: response.status,
        content: responseContent,
        headers: this.parseResponseHeaders(response.headers)
      };

      this.populateData(httpResponse);
      return httpResponse;
    });

    // Create the timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), options.timeout);
    });

    // Race the fetch against the timeout
    return Promise.race([fetchPromise, timeoutPromise]);
  }
}

export { HTTPClient as HTTP };
