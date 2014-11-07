describe("angular-loader::plain URL", function() {

  beforeEach(module('angular-async-loader', function($ngLoadProvider){
    $ngLoadProvider.addModuleDep(["ngAnimate", "ngRoute"]);
    $ngLoadProvider
      .defineDep(":jquery", ['//code.jquery.com/jquery-1.11.0.min.js'])
      .defineDep("$animate", ['https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-animate.js'])
      .defineDep("$route", ['https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-route.js'])

  }));

  it("Should load the script from http://", function (done) {
    inject(function($ngLoad) {
      $ngLoad('http://code.jquery.com/jquery-1.11.0.min.js').then(function() {
        expect(typeof $).toEqual("function");
        done();
      });
    });
  });

  it("Should load the script from //", function (done) {
    inject(function($ngLoad) {
      $ngLoad('//code.jquery.com/jquery-1.11.0.min.js').then(function() {
        expect(typeof $).toEqual("function");
        done();
      });
    });
  });

  it("Should load the script from https://", function (done) {
    inject(function($ngLoad) {
      $ngLoad('https://code.jquery.com/jquery-1.11.0.min.js').then(function() {
        expect(typeof $).toEqual("function");
        done();
      });
    });
  });

  it("Should load the script configured", function (done) {
    inject(function($ngLoad) {
      $ngLoad(':jquery').then(function() {
        expect(typeof $).toEqual("function");
        done();
      });
    });
  });


  it("Should give me access to $animate", function(done) {
    inject(function($ngLoad) {
      $ngLoad("$animate").then(function($animate) {
        expect(typeof $animate).toEqual("function");
        done();
      });
    });
  });


  it("Should give me access to $animate and $route", function(done) {
    inject(function($ngLoad) {
      $ngLoad(["$animate", "$route"]).then(function(dep) {
        expect(typeof dep.$animate).toEqual("function");
        expect(typeof dep.$route).toEqual("function");
        done();
      });
    });
  });

});
