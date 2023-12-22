import {
  HTTPCommon as IHTTPCommon,
  HTTPServer as IHTTPServer,
  HTTPClient as IHTTPClient
} from '@maka/types';

class HTTPCommon {
  static MAX_LENGTH: number = 500;

  static truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + '...' : str;
  }

  static populateData(response: any): void {
    const contentType: string = (response.headers['content-type'] || ';').split(';')[0];
    if (['application/json', 'text/javascript', 'application/javascript', 'application/x-javascript'].indexOf(contentType) >= 0) {
      try {
        response.data = JSON.parse(response.content);
      } catch (err) {
        response.data = response.content;
      }
    } else {
      response.data = response.content;
    }
    delete response.content;
  }

  static setRequestHeaders(headers: { [key: string]: any }, request: XMLHttpRequest): void {
    for (const [key, value] of Object.entries(headers)) {
      request.setRequestHeader(key, value);
    }
  }

  static parseResponseHeaders(headerStr: string): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    for (const line of headerStr.trim().split(/[\r\n]+/)) {
      const parts: string[] = line.split(': ');
      const header: string | undefined = parts.shift();
      const value: string = parts.join(': ');
      if (header) headers[header] = value;
    }
    return headers;
  }

  static async get(url: string, callOptions?: IHTTPServer.Options | IHTTPClient.Options): Promise<IHTTPCommon.HTTPResponse> {
    return this.call("GET", url, callOptions);
  }

  static async post(url: string, callOptions?: IHTTPServer.Options | IHTTPClient.Options): Promise<IHTTPCommon.HTTPResponse> {
    return this.call("POST", url, callOptions);
  }

  static async put(url: string, callOptions?: IHTTPServer.Options | IHTTPClient.Options): Promise<IHTTPCommon.HTTPResponse> {
    return this.call("PUT", url, callOptions);
  }

  static async del(url: string, callOptions?: IHTTPServer.Options | IHTTPClient.Options): Promise<IHTTPCommon.HTTPResponse> {
    return this.call("DELETE", url, callOptions);
  }

  static async patch(url: string, callOptions?: IHTTPServer.Options | IHTTPClient.Options): Promise<IHTTPCommon.HTTPResponse> {
    return this.call("PATCH", url, callOptions);
  }

  // Define the call method as abstract (not implemented)
  static async call(method: string, url: string, options?: IHTTPServer.Options | IHTTPClient.Options): Promise<IHTTPCommon.HTTPResponse> {
    throw new Error("Method 'call' must be implemented");
  }
}

export default HTTPCommon;
