import { URL } from "meteor/url";
import HTTPCommon from "./http-common";


class HTTPClient extends HTTPCommon {
  static async call(method: string, url: string, options: ClientOptions = {}): Promise<HTTPResponse> {
    method = method.toUpperCase();

    const headers: { [key: string]: string } = {};
    let content = options.content;
    if (options.data) {
      content = JSON.stringify(options.data);
      headers['Content-Type'] = 'application/json';
    }

    let paramsForUrl: any, paramsForBody: any;
    if (content || method === "GET" || method === "HEAD") {
      paramsForUrl = options.params;
    } else {
      paramsForBody = options.params;
    }

    const constructedUrl = new URL(url);

    if (options.auth) {
      const base64 = btoa(options.auth);
      headers['Authorization'] = `Basic ${base64}`;
    }

    if (paramsForBody) {
      content = new URLSearchParams(paramsForBody).toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, constructedUrl.toString(), true);

      this.setRequestHeaders(headers, xhr);

      xhr.onload = () => {
        let response = {
          statusCode: xhr.status,
          content: xhr.responseText,
          headers: this.parseResponseHeaders(xhr.getAllResponseHeaders())
        };

        this.populateData(response);
        resolve(response);
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(content);
    });
  }
}

export { HTTPClient as HTTP };
