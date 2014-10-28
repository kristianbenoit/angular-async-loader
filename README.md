angular-loader
==============

Load angular modules and their dependencies asynchronously.

If the application is offline, the loader waits to be online
to start downloading. See ngCordova:$cordovaNetwork. If $cordovaNetwork
is available, it will use it to check online status. Otherwise
it uses navigator.onLine which does not work with all browser.
Firefox gets offline only if in offline mode, not if the connection is down.

TODO:
Use $cordovaNetwork
Make the getScript configurable
Load multiple services
Send notified of the progress


To load other modules asynchronously:
```javascript
angular.module("app", ["angular-loader"])
```

Configure the loader:
```javascript
.config(function($ngLoadProvider) {
  $ngLoadProvider.loadModules(["<modulenames>", ...])
  .defineDep("<service>", ["<scripturls>", ...])
  .defineDep(...);

});
```

Load a service in your controller:
```javascript
.controller("myCtrl", function($ngLoad) {
  $ngLoad("<service>").then(function(<service>) {
    // Do something with <service>.
  });
});
```

To be implemented
=================

Load multiple services:
```javascript
.controller("myCtrl", function($ngLoad) {
  $ngLoad(["service1", "service2", ...]).then(function(dep) {
    // dep => {service1 : <service1>, service2 : <service2>, ...}
    // i.e. You can user dep.service1 to use service1.
  });
});
```

Get notified of the progess:
```javascript
.controller("myCtrl", function($ngLoad) {
  $ngLoad("service").then(function(dep) {
    // Do something with <service>.
  }, function (err) {
    console.log(err);
  }, function (notif) {
    // Sends you notifications as it loads scripts.
  });
});
```
