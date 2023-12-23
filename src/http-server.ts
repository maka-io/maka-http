import { fetch } from 'meteor/fetch';
import { URL, URLSearchParams } from 'meteor/url';
import HTTPCommon from './http-common';
import { HTTPServer as IHTTPServer, HTTPCommon as IHTTPCommon } from '@maka/types';


class HTTPServer extends HTTPCommon {
  static async call(method: string, url: string, options: IHTTPServer.Options = {}): Promise<IHTTPCommon.HTTPResponse> {
    let attempts = 0;
    const maxRetries = options.maxRetries ?? 1;
    let retryDelay = options.retryDelay ?? 1000;

    while (attempts < maxRetries) {
      try {
        // Process interceptors
        for (const interceptor of this.requestInterceptors) {
          const result = await interceptor(method, url, options);
          url = result.url;
          options = result.options;
        }

        // Set up headers and content
        const headers = options.headers || {};
        if (options.data) {
          headers['Content-Type'] = 'application/json';
          content = JSON.stringify(options.data);
        }

        const requestOptions = {
          method: method.toUpperCase(),
          body: content,
          headers: headers,
          redirect: options.followRedirects === false ? 'manual' : 'follow',
        };

        // Fetch request with timeout
        const fetchPromise = fetch(new URL(url).toString(), requestOptions).then(async response => {
          const responseContent = await response.text();
          return {
            statusCode: response.status,
            content: responseContent,
            headers: this.parseResponseHeaders(response.headers)
          };
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject("Request timed out"), options.timeout || 30000);
        });

        // Race the fetch against the timeout
        const httpResponse = await Promise.race([fetchPromise, timeoutPromise]);
        this.populateData(httpResponse);
        return httpResponse;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;  // Exponential backoff
      }
    }

    throw "All retry attempts failed";
  }
}

export { HTTPServer as HTTP };

