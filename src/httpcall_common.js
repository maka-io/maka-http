class HTTPCommon {
  static MAX_LENGTH = 500;

  static makeErrorByStatus(statusCode, content) {
    let message = "failed [" + statusCode + "]";
    if (content) {
      const stringContent = typeof content === "string" ? content : content.toString();
      message += ' ' + this.truncate(stringContent.replace(/\n/g, ' '), this.MAX_LENGTH);
    }
    return new Error(message);
  }

  static truncate(str, length) {
    return str.length > length ? str.slice(0, length) + '...' : str;
  }

  static populateData(response) {
    const contentType = (response.headers['content-type'] || ';').split(';')[0];
    if (['application/json', 'text/javascript', 'application/javascript', 'application/x-javascript'].indexOf(contentType) >= 0) {
      try {
        response.data = JSON.parse(response.content);
      } catch (err) {
        response.data = null;
      }
    } else {
      response.data = null;
    }
  }

  static setRequestHeaders(headers, request) {
    for (const [key, value] of Object.entries(headers)) {
      request.setRequestHeader(key, value);
    }
  }

  static parseResponseHeaders(headerStr) {
    const headers = {};
    for (const line of headerStr.trim().split(/[\r\n]+/)) {
      const parts = line.split(': ');
      const header = parts.shift();
      const value = parts.join(': ');
      headers[header] = value;
    }
    return headers;
  }

  static async get(url, callOptions) {
    return this.call("GET", url, callOptions);
  }

  static async post(url, callOptions) {
    return this.call("POST", url, callOptions);
  }

  static async put(url, callOptions) {
    return this.call("PUT", url, callOptions);
  }

  static async del(url, callOptions) {
    return this.call("DELETE", url, callOptions);
  }

  static async patch(url, callOptions) {
    return this.call("PATCH", url, callOptions);
  }

  // Define the call method as abstract (not implemented)
  static async call(method, url, options) {
    throw new Error("Method 'call' must be implemented");
  }
}

export default HTTPCommon;
