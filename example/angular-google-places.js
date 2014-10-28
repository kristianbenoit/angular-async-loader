(function() {
  angular.module("google-places", [])
  .factory("autocompleteService", function($q) {
    AutocompleteWrapper = function() {
      this.autocomplete = new google.maps.places.AutocompleteService();
    }

    AutocompleteWrapper.prototype.getPlacePredictions = function(options) {
      var deferred = $q.defer();
      this.autocomplete.getPlacePredictions(options, function (res, status) {
        console.log(status);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          deferred.resolve(res);
        } else {
          deferred.reject({res: res, status: status});
        }
      });
      return deferred.promise;
    }

    return new AutocompleteWrapper();
  });
})();
