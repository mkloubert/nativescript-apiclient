[![npm](https://img.shields.io/npm/v/nativescript-apiclient.svg)](https://www.npmjs.com/package/nativescript-apiclient)
[![npm](https://img.shields.io/npm/dt/nativescript-apiclient.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-apiclient)

# NativeScript API Client

A [NativeScript](https://nativescript.org/) module module for simply calling HTTP based APIs.

## License

[MIT license](https://raw.githubusercontent.com/mkloubert/nativescript-apiclient/master/LICENSE)

## Platforms

* Android
* iOS

## Installation

Run

```bash
tns plugin add nativescript-apiclient
```

inside your app project to install the module.

## Demo

For quick start have a look at the [plugin/index.ts](https://github.com/mkloubert/nativescript-apiclient/blob/master/plugin/index.ts) or use the "IntelliSense" of your IDE to learn how it works.

Otherwise...

## Usage

### Import

```typescript
import ApiClient = require("nativescript-apiclient");
```

### Example

```typescript
interface IUser {
    displayName: string;
    id?: number;
    name: string;
}

var client = ApiClient.newClient({
    baseUrl: "https://example.com/users",
    route: "{id}",  
});

client.clientError(function(result : ApiClient.IApiClientResult) {
                       // handle all responses with status code 400 to 499
                   })
      .serverError(function(result : ApiClient.IApiClientResult) {
                       // handle all responses with status code 500 to 599
                   })
      .success(function(result : ApiClient.IApiClientResult) {
                    // handle all responses with status codes less than 400
                    
                    var user = result.getJSON<IUser>();
               })
      .error(function(err : ApiClient.IApiClientError) {
                 // handle API client errors
             })
      .completed(function(err : ApiClient.IApiClientCompleteContext) {
                     // invoked after "result" and "error" actions
                 });

for (var userId = 1; userId <= 100; userId++) {
    // start a GET request
    client.get({
        routeParams: {
            id: userId
        }
    });
}
```
