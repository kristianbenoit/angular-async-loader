(function() {

  angular.module("angular-loader", [])

  .config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
    console.log("Redefining angular.module");
    var moduleFunc = angular.module;
    angular.module = function(name, dep) {
      console.log("creating a module named " + name);
      var module = moduleFunc(name, dep);
      if (dep) {
        module.controller = $controllerProvider.register;
        module.compile = $compileProvider.directive;
        module.filter = $filterProvider.register;
        module.provider = $provide.provider;
        module.factory = $provide.factory;
        module.value = $provide.value;
        module.service = $provide.service;
        module.constant = $provide.constant;
        module.decorator = $provide.decorator;
      }
      return module;
    };
  })
    

  .provider("$ngLoad", function() {
    var moduleFunc = angular.module;

    var dependancies = {};
    return {
      defineDep : function(name, dep) {
        dependancies[name] = dep;
      },

      $get : function($window, $interval, $timeout, $q, $injector) {
        var WriteContext = function() {
          this._currentContext = null;
          this._contextList = [];
          var thisinstance = this;

          $window.addEventListener("online", function(e) {
            // Try for 10 seconds to get the script after getting online.
            var ctx = thisinstance.getCurrent();
            if (ctx) {
              console.log("got online, trying every in 5s");
              if (ctx.onlinePromise) {
                $interval.cancel(ctx.onlinePromise);
              }
              ctx.onlinePromise = $interval(function() {
                thisinstance.getScript(ctx.url);
              }, 5000, 20);
            }
          });

          $window.removeEventListener("offline", function(e) {
            var ctx = this.getCurrent();
            if (ctx && ctx.onlinePromise) {
              $interval.cancel(ctx.onlinePromise);
              ctx.onlinePromise = null;
            }
          });

        };

        WriteContext.prototype.push = function(context) {
          console.log("pushing " + context.url);
          var deferred =  $q.defer();
          angular.extend(context, {writeCount: 0, deferred : deferred, onlinePromise : null});
          this._contextList.push(context);
          if (!this.getCurrent()) {
            this.shift();
          }

          return deferred.promise;
        };

        WriteContext.prototype.shift = function() {
          ctx = this.getCurrent();
          if (ctx && ctx.onlinePromise) {
            $interval.cancel(ctx.onlinePromise);
          }
          var ctx = this._currentContext = this._contextList.shift();
          console.log("Shifting to :");
          console.log(ctx);
          if (ctx) {
            if (navigator.onLine) {
              console.log("already online, getting script");
              this.getScript(ctx.url);
            } else {
              ctx.deferred.promise.then(function() {
                $interval.cancel(ctx.onlinePromise);
              });
            }
          }
        };

        WriteContext.prototype.getCurrent = function() {
          return this._currentContext;
        };

        WriteContext.prototype.getScript = function(url) {
          console.log("getting " + url);
          var ctx = this.getCurrent();
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement("script");
          script.src = url;

          ctx.writeCount++;
          var myCount = ctx.writeCount;
          console.log("registering listener");
          script.addEventListener('load', function (event) {

            if (ctx.onlinePromise) {
              $interval.cancel(ctx);
            }
            console.log("load reveived for " + url);
            // Check if this script has injected another script before
            // calling back.
            if (ctx.writeCount === myCount) {
              $timeout(function() {
                console.log("no write received, returning");
                ctx.deferred.resolve(ctx.url);
                document.write.context.shift();
              }, 0);
            }
          }, false);
          console.log("after listener");

          try {
            console.log("appendingChild");
            head.appendChild(script);
          } catch(err) {
            ctx.deferred.reject(err);
          }
        };

        document.superWrite = document.write;
        document.write = function(text) {
          console.log("Asked to write " + text);
          var managed = false;
          console.log("current is :");
          console.log(document.write.context.getCurrent());
          if (document.write.context.getCurrent()) {
            var res = /^<script[^>]*src="([^"]*)"[^>]*><\/script>$/.exec(text);
            if (res) {
              managed = true;
              document.write.context.getScript(res[1]);
            }
          }

          if (!managed) {
            document.superWrite(text);
          }
        };
        document.write.context = new WriteContext();


        return function(name) {
          if (name.substring(0,7) === "http://" || name.substring(0,8) === "https://") {
            return document.write.context.push({url : name});
          } else {
            var promises = [];
            dependancies[name].forEach(function(d) {
              promises.push(document.write.context.push({url: d}));
            });
            return $q.all(promises).then(function() {
              return $injector.get(name);
            });
          }
        };
      }
    };
  });
})();
