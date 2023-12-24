import HTTPCommon from "./http-common";
import { HTTPClient as IHTTPClient, HTTPCommon as IHTTPCommon } from '@maka/types';


class HTTPClient extends HTTPCommon {
  static async call(
    method: string,
    url: string,
    optionsOrCallback?: IHTTPClient.Options | ((error: any, result?: IHTTPCommon.HTTPResponse) => void),
    callback?: (error: any, result?: IHTTPCommon.HTTPResponse) => void
  ): Promise<IHTTPCommon.HTTPResponse | void> {
    let options: IHTTPClient.Options = {};
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else if (optionsOrCallback) {
      options = optionsOrCallback;
    }

    try {
      let attempts = 0;
      const maxRetries = options.maxRetries ?? this.MAX_RETRIES;
      let retryDelay = options.retryDelay ?? this.RETRY_DELAY;

      while (attempts <= maxRetries) {
        try {
          for (const interceptor of this.requestInterceptors) {
            const result = await interceptor(method, url, options, callback);
            url = result.url;
            options = result.options;
          }

          const headers: HeadersInit = new Headers(options.headers || {});
          const body: BodyInit | null = options.data ? JSON.stringify(options.data) : options.data;
          if (options.data) headers.set('Content-Type', 'application/json');

          const fetchPromise = fetch(url, { method, headers, body }).then(async response => {
            if (options.rawResponse) {
              const arrayBuffer = await response.arrayBuffer();
              // Return the raw response for handling by the caller
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
            setTimeout(() => reject("Request timed out"), options.timeout ?? 30000);
          });

          // Await the result of either the fetch or the timeout
          const httpResponse = await Promise.race([fetchPromise, timeoutPromise]);
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
          // Retry logic
          if (++attempts >= maxRetries) {
            if (callback) {
              callback(error);  // Invoke callback with error after all retries
              return;  // Exit function after callback
            } else {
              throw error;  // Throw error for async/await
            }
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2;
        }

      }

      throw "All retry attempts failed";
    } catch (error) {
      if (callback) callback(error);
      else throw error;
    }
  }
}

export { HTTPClient as HTTP };

