declare module 'meteor/maka:http' {
    namespace HTTP {
      interface ServerOptions {
        data?: any;
        params?: { [key: string]: any };
        auth?: string;
        headers?: { [key: string]: string };
        followRedirects?: boolean;
      }

      interface ClientOptions {
        data?: any;
        params?: { [key: string]: any };
        auth?: string;
        headers?: { [key: string]: string };
      }

      interface HTTPResponse {
        statusCode?: number | undefined;
        headers?: { [id: string]: string } | undefined;
        data?: any;
      }

      function call(
        method: string,
        url: string,
        options?: HTTP.ServerOptions | HTTP.ServerOptions,
      ): Promise<HTTP.HTTPResponse>;

      function del(url: string, callOptions?: HTTP.ServerOptions | HTTP.ServerOptions): Promise<HTTP.HTTPResponse>;

      function get(url: string, callOptions?: HTTP.ServerOptions | HTTP.ServerOptions): Promise<HTTP.HTTPResponse>;

      function post(url: string, callOptions?: HTTP.ServerOptions | HTTP.ServerOptions): Promise<HTTP.HTTPResponse>;

      function put(url: string, callOptions?: HTTP.ServerOptions | HTTP.ServerOptions): Promise<HTTP.HTTPResponse>;

      function call(
        method: string,
        url: string,
        options?: {
          data?: Object | undefined;
          query?: string | undefined;
          params?: Object | undefined;
          auth?: string | undefined;
          headers?: Object | undefined;
          timeout?: number | undefined;
          followRedirects?: boolean | undefined;
          npmRequestOptions?: Object | undefined;
          beforeSend?: Function | undefined;
        },
      ): Promise<HTTP.HTTPResponse>;
    }
}
