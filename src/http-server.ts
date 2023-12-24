import { fetch } from 'meteor/fetch';
import { URL } from 'meteor/url';
import HTTPCommon from './http-common';
import { HTTPServer as IHTTPServer, HTTPCommon as IHTTPCommon } from '@maka/types';


class HTTPServer extends HTTPCommon {
  static async call(
    method: string,
    url: string,
    optionsOrCallback?: IHTTPServer.Options | ((error: any, result?: IHTTPCommon.HTTPResponse) => void),
    callback?: (error: any, result?: IHTTPCommon.HTTPResponse) => void
  ): Promise<IHTTPCommon.HTTPResponse | void> {
    let options: IHTTPServer.Options = {};
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (optionsOrCallback) {
      options = optionsOrCallback;
    }

    let attempts = 0;
    const maxRetries = options.maxRetries ?? this.MAX_RETRIES;
    let retryDelay = options.retryDelay ?? this.RETRY_DELAY;


    while (attempts <= maxRetries) {
      try {
        // Process interceptors
        for (const interceptor of this.requestInterceptors) {
          const result = await interceptor(method, url, options, callback);
          url = result.url;
          options = result.options;
        }

        const headers = options.headers || {};
        let content;

        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && options.data) {
          headers['Content-Type'] = 'application/json';
          content = JSON.stringify(options.data);
        }

        const requestOptions: RequestInit = {
          method: method.toUpperCase(),
          headers: headers,
          redirect: options.followRedirects === false ? 'manual' : 'follow',
        };

        // Only add the body if there is content
        if (content !== undefined) {
          requestOptions.body = content;
        }

        // Fetch request with timeout
        const fetchPromise = fetch(new URL(url).toString(), requestOptions).then(async response => {
          if (options.rawResponse) {
            let arrayBuffer = await response.arrayBuffer();
            // Return the raw response
            return {
              statusCode: response.status,
              content: arrayBuffer,
              headers: this.parseResponseHeaders(response.headers)
            };
          } else {
            // Normal processing of the response
            const responseContent = await response.text();
            return {
              statusCode: response.status,
              content: responseContent,
              headers: this.parseResponseHeaders(response.headers)
            };
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject("Request timed out"), options.timeout || 30000);
        });

        // Race the fetch against the timeout
        const httpResponse = await Promise.race([fetchPromise, timeoutPromise]);


        // create the data property and drop the content
        this.populateData(httpResponse);

        // For drop in backwards compatibility, we return the result via callback
        // if one is provided, otherwise we return the result via async/await
        if (callback) {
          // Callback pattern
          callback(null, httpResponse);
          return;
        } else {
          // Async/await pattern
          return httpResponse;
        }
      } catch (error) {
        if (++attempts >= maxRetries) {
          if (callback) {
            callback(error);  // Invoke callback with error after all retries
            return;  // Exit function after callback
          } else {
            throw error;  // Throw error for async/await
          }
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;  // Exponential backoff
      }
    }

    throw "All retry attempts failed";
  }
}

export { HTTPServer as HTTP };

