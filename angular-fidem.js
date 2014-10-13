/*! Angular fidem v0.0.0 | © 2014 Fidem | License MIT */
(function (window, angular, undefined) {'use strict';

  /**
   * GeoLocalisation options.
   */

  var geolocOptions = {
    enableHighAccuracy: true,
    timeout: 3000,
    maximumAge: 30000
  };

  /**
   * Fidem provider.
   * Log action to Fidem API
   */

  angular.module('fidem', []).provider('fidem', function () {

    /**
     * Provider configuration.
     */

    var config = {
      endpoint: null,
      key: null
    };

    /**
     * Define API endpoint.
     *
     * @param {string} endpoint
     * @returns {fidemProvider}
     */

    this.setApiEndpoint = function (endpoint) {
      config.endpoint = endpoint;
      return this;
    };

    /**
     * Define API key.
     *
     * @param {string} key
     * @returns {fidemProvider}
     */

    this.setApiKey = function (key) {
      config.key = key;
      return this;
    };

    /**
     * Interceptors used to modify action before sending it.
     */

    var interceptors = this.interceptors = [];

    /**
     * Fidem service getter.
     */

    this.$get = [
      '$http', '$window', '$q', '$rootScope',
      function ($http, $window, $q, $rootScope) {
        // Fidem service.
        var fidem = {};

        /**
         * Log an action.
         *
         * @example
         *
         * fidem.log({foo: 'bar'})
         *
         * @param {object} action Action to log
         * @returns {Promise}
         */

        fidem.log = function (action) {
          // Convert action to a promise.
          var promise = $q.when(action);

          // Chain of interceptors.
          var chain = [];

          // Push interceptors to the chain.
          angular.forEach(interceptors, function (interceptor) {
            chain.push(interceptor);
          });

          // Push geoloc interceptor at the end.
          chain.push(geolocInterceptor);

          // Apply interceptors.
          while (chain.length) {
            promise = promise.then(chain.shift());
          }

          // Post action.
          return promise.then(function (action) {
            return $http.post(config.endpoint + '/api/gamification/actions', action, {
              headers: {
                'X-Fidem-AccessApiKey': config.key
              }
            });
          });
        };

        /**
         * GeoLocalisation interceptor.
         *
         * @param {object} action
         */

        function geolocInterceptor(action) {
          // If not supported, do nothing.
          if (!$window.navigator || !$window.navigator.geolocation) {
            action.coordinates = null;
            return action;
          }

          var deferred = $q.defer();

          $window.navigator.geolocation.getCurrentPosition(function success(position) {
            // In case of success, we add coordinates to the action.
            $rootScope.$apply(function () {
              action.coordinates = {
                lat: position.coords.latitude,
                long: position.coords.longitude
              };

              deferred.resolve(action);
            });
          }, function error() {
            // In case of error, we set coordinates to null.
            $rootScope.$apply(function () {
              action.coordinates = null;
              deferred.resolve(action);
            });
          }, geolocOptions);

          return deferred.promise;
        }

        return fidem;
      }
    ];
  });

})(window, window.angular);