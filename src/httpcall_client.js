import { URL } from "meteor/url";
import HTTPCommon from "./httpcall_common";

class HTTPClient extends HTTPCommon {
  static async call(method, url, options = {}) {
    method = (method || "").toUpperCase();

    let headers = {};
    let content = options.content;
    if (options.data) {
      content = JSON.stringify(options.data);
      headers['Content-Type'] = 'application/json';
    }

    let paramsForBody;
    if (content || method === "GET" || method === "HEAD") {
      paramsForUrl = options.params;
    } else {
      paramsForBody = options.params;
    }

    const constructedUrl = new URL(url); // Assuming URL construction logic here

    if (options.auth) {
      const base64 = btoa(options.auth);
      headers['Authorization'] = `Basic ${base64}`;
    }

    if (paramsForBody) {
      content = new URLSearchParams(paramsForBody).toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers[key] = value;
      }
    }

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, constructedUrl.toString(), true);

      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }

      xhr.onload = () => {
        let response = {
          statusCode: xhr.status,
          content: xhr.responseText,
          headers: this.parseResponseHeaders(xhr.getAllResponseHeaders())
        };

        this.populateData(response);

        if (xhr.status >= 400) {
          reject(this.makeErrorByStatus(xhr.status, response.content));
        } else {
          resolve(response);
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(content);
    });
  }
}

export { HTTPClient as HTTP }
