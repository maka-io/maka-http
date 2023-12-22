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
the original HTTP contracts, but the calls return Promises and no longer use
callbacks.

Previously:
```
    import { HTTP } from 'meteor/http';

    HTTP.get('url', (error, response) => {
        if (error) {
            console.error(error);
        }

        console.log(response);
    });
```

Currently:
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

2. All call, get, post, put, delete, and options return a Promise.  So
    they'll need to be async/await-ed.

3. If there is an error (400 or over), this will no longer return an Error object.
    It will simply return the response from the server as it does with all other status codes.

4. The tests are broken! I plan on fixing them, but I'm le` tired.

See the [HTTP section in the Meteor docs](http://docs.meteor.com/#http) for more details...
but with a grain of salt, based on the changes above, and that Meteor has deprecated those
documents 😉.


## Acknowledgments
Thank you to Meteor and the Meteor community who kept this original package running well!
