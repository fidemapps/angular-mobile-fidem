# Angular Mobile Fidem

Angular service to interact with Fidem API.

## Install

### Using bower

```js
bower install angular-mobile-fidem
```

## Usage

```js
angular.module('app', ['fidem'])
.config(function (fidemProvider) {
  // Define API endpoint and API key.
  fidemProvider
  .setApiEndpoint('http://services.fidemapps.com')
  .setApiKey('yourApiKey');
  .setSecretKey('yourSecretKey');
})
.controller('AppCtrl', function (fidem) {
  // Log an action.
  fidem.log({
    type: 'viewShow',
    data: {
      id: 'show1',
      name: 'The Big Show'
    }
  });
});
```

### Interceptors

Using interceptors, it's possible to modify data of action synchronously or asynchronously. It's the same behaviour as Angular [$http service interceptors](https://docs.angularjs.org/api/ng/service/$http#interceptors).

```js
angular.module('app', ['fidem'])
.config(function (fidemProvider) {
  // Add a synchronous interceptor.
  fidemProvider.interceptors.push(function (action, $injector) {
    // Inject $window using angular injector.
    var $window = $injector.get('$window');

    // Add member_id to action.
    action.member_id = $window.user ? $window.user.fidem_member_id : null;

    // Return action.
    return action;
  });

  // Add an asynchronous interceptor.
  fidemProvider.interceptors.push(function (action, $injector) {
    // Inject $http using angular injector.
    var $http = $injector.get('$http');

    // Make an asynchronous request using $http.
    // Also returns the promise.
    return $http.get('/user/' + action.user_id)
    .then(function (result) {
      // Update action with member_id.
      action.member_id = result.data.member_id;
      // Return action to create a new promise with the action as result.
      return action;
    });
  });
})
```

Interceptors takes two arguments, the first is the action, and the second is the [Angular $injector](https://docs.angularjs.org/api/auto/service/$injector).

They must returns the action or a promise with the action as result.

## License

MIT
