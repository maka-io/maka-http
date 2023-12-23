# maka:http
[Source code of released version](https://github.com/maka-io/maka-http)
***


## Installation

```
    $ meteor add maka:http
```

If you're using maka-cli:

```
    $ maka add maka:http
```

## Docs
This is just an iteration of the Meteor HTTP package.  It generally adheres to
the original HTTP contracts, but the calls can either return a Callback OR a Promise.

You can still use the old callback way (as in http/meteor):
```
    import { HTTP } from 'meteor/maka:http';

    HTTP.get('url', (error, response) => {
        if (error) {
            console.error(error);
        }

        console.log(response);
    });
```

Or migrate to:
```
    import { HTTP } from 'meteor/maka:http';

    const { data, statusCode } = await HTTP.get('url');

    if (statusCode > 400) {
        console.error(data);
    } else {
        console.log(data);
    }
```

## Changes

1. The response object no longer contains both a 'data' AND a 'content'.  It only
    contains the data object.  This object will be in a format based on the
    content type. (e.g., 'application/json')

2. All call, get, post, put, del, and options will return a Promise only if a callback isn't defined. (see previous section)

3. If there is an error (400 or over), this will no longer return an Error object.
    It will simply return the response from the server as it does with all other status codes.

4. The tests are broken! I plan on fixing them.

5. There is no longer an 'auth' option.  To declare 'auth' use the headers section.

6. 'npmRequestOptions' and 'beforeSend' have been removed, not sure it actually did anything in the end 🤔

7. There are now interceptors that will allow you to catch either the request before it goes out,
    or the response just before it's handled.
    They can be added on the server or client, with the same signature.

```typescript
    HTTP.addRequestInterceptor(async (method, url, options) => {
      if (method === 'GET') {
        console.log('Intercepted GET request to URL:', url);
      }
      return { method, url, options };
    });
```

NOTE: If you are using callbacks, then you should include callback in the return:
```typescript
    HTTP.addRequestInterceptor(async (method, url, options, callback) => {
      if (method === 'GET') {
        console.log('Intercepted GET request to URL:', url);
      }
      return { method, url, options, callback };
    });
```


8. There are now two options for retries: `maxRetries` and `retryDelay`.  Default is `maxRetry: 1` and `retryDelay: 1000`
    Retry delays are in miliseconds (so default is 1 seconds), and they are exponential.
    Usable on both Server and Client with the same interface.

```typescript
    const { data, statusCode } = await HTTP.get(url, {
      retryDelay: 2000,
      maxRetries: 3,
      timeout: 2000
    });
```


See the [HTTP section in the Meteor docs](http://docs.meteor.com/#http) for more details...
but with a grain of salt, based on the changes above, and that Meteor has deprecated those
documents 😉.


## Acknowledgments
Thank you to Meteor and the Meteor community who kept this original package running well!
