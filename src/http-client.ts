import HTTPCommon from "./http-common";
import { HTTPClient as IHTTPClient, HTTPCommon as IHTTPCommon } from '@maka/types';


class HTTPClient extends HTTPCommon {
  static async call(method: string, url: string, options: IHTTPClient.Options = {}): Promise<IHTTPCommon.HTTPResponse> {
    try {
      let attempts = 0;
      const maxRetries = options.maxRetries ?? 1;
      let retryDelay = options.retryDelay ?? 1000;

      while (attempts < maxRetries) {
        try {
          for (const interceptor of this.requestInterceptors) {
            const result = await interceptor(method, url, options);
            url = result.url;
            options = result.options;
          }

          const headers: HeadersInit = new Headers(options.headers || {});
          const body: BodyInit | null = options.data ? JSON.stringify(options.data) : options.content;
          if (options.data) headers.set('Content-Type', 'application/json');

          const fetchPromise = fetch(url, { method, headers, body }).then(async response => {
            const responseContent = await response.text();
            return {
              statusCode: response.status,
              content: responseContent,
              headers: this.parseResponseHeaders(response.headers)
            };
          });

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject("Request timed out"), options.timeout ?? 3000);
          });

          // Await the result of either the fetch or the timeout
          const httpResponse = await Promise.race([fetchPromise, timeoutPromise]);
          this.populateData(httpResponse);

          return httpResponse; // Return the successful response
        } catch (error) {
          // Retry logic
          if (++attempts >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2;
        }

      }

      throw "All retry attempts failed";
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export { HTTPClient as HTTP };

