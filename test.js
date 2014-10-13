var expect = chai.expect;

describe('Fidem provider', function () {
  var fidem, $httpBackend, $window, $rootScope, $q, $timeout, interceptors,
    logAction, expectRequest;

  beforeEach(module('fidem', function (fidemProvider, $provide) {
    fidemProvider.setApiEndpoint('http://services.fidemapps.com');
    fidemProvider.setApiKey('myApiKey');
    interceptors = fidemProvider.interceptors;

    $provide.value('$window', {
      config: 'myConfig',
      navigator: {}
    });
  }));

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
    fidem = $injector.get('fidem');
    $window = $injector.get('$window');
    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');
    $timeout = $injector.get('$timeout');

    $httpBackend.whenPOST('http://services.fidemapps.com/api/gamification/actions')
    .respond(200, {});

    logAction = function (done) {
      fidem.log({foo: 'bar'}).then(function () { done(); });
      $rootScope.$digest();
    };

    expectRequest = function (data) {
      $httpBackend.expectPOST(
        'http://services.fidemapps.com/api/gamification/actions',
        data,
        function (headers) {
          return headers['X-Fidem-AccessApiKey'] === 'myApiKey';
        }
      );
    };
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('without geolocation', function () {
    it('should post action without coordinates', function (done) {
      expectRequest({
        foo: 'bar',
        coordinates: null
      });

      logAction(done);

      $httpBackend.flush();
    });
  });

  describe('with geolocation (success)', function () {
    beforeEach(function () {
      $window.navigator.geolocation = {};
      $window.navigator.geolocation.getCurrentPosition = function (success) {
        $timeout(function () {
          success({coords: {latitude: 10, longitude: 20}});
        });
      };
    });

    it('should post action with coordinates', function (done) {
      expectRequest({
        foo: 'bar',
        coordinates: {lat: 10, long: 20}
      });

      logAction(done);

      $httpBackend.verifyNoOutstandingRequest();

      $timeout.flush();
      $httpBackend.flush();
    });
  });

  describe('with geolocation (error)', function () {
    beforeEach(function () {
      $window.navigator.geolocation = {};
      $window.navigator.geolocation.getCurrentPosition = function (success, error) {
        $timeout(function () {
          error();
        });
      };
    });

    it('should post action without coordinates', function (done) {
      expectRequest({
        foo: 'bar',
        coordinates: null
      });

      logAction(done);

      $httpBackend.verifyNoOutstandingRequest();

      $timeout.flush();
      $httpBackend.flush();
    });
  });

  describe('interceptors', function () {
    it('should support a synchronous interceptor', function (done) {
      interceptors.push(function (action) {
        action.hooked = true;
        return action;
      });

      expectRequest({
        foo: 'bar',
        coordinates: null,
        hooked: true
      });

      logAction(done);

      $httpBackend.flush();
    });

    it('should be possible to inject something', function (done) {
      interceptors.push(function (action, $injector) {
        var $window = $injector.get('$window');
        action.hooked = true;
        action.config = $window.config;
        return action;
      });

      expectRequest({
        foo: 'bar',
        coordinates: null,
        hooked: true,
        config: 'myConfig'
      });

      logAction(done);

      $httpBackend.flush();
    });

    it('should support an asynchronous interceptor', function (done) {
      interceptors.push(function (action) {
        var deferred = $q.defer();

        $timeout(function () {
          action.hooked = true;
          deferred.resolve(action);
        });

        return deferred.promise;
      });

      expectRequest({
        foo: 'bar',
        coordinates: null,
        hooked: true
      });

      logAction(done);

      $timeout.flush();
      $httpBackend.flush();
    });
  });
});