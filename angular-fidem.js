'use strict';

angular.module('angular-fidem').factory('FidemServices', ['$http', 'Settings', 'geolocation', function ($http, Settings, geolocation) {
    return {
        logAction: function (action) {

            // Must be a kind of call or global option (optional) to be able to adjust the action before sending it
            function adjustAction() {
                action.member_id = (window.user) ? window.user.fidem_member_id : null;
                action.session_id = (window.fidemSessionId) ? window.fidemSessionId : null;
            }

            function postAction() {
                $http.post(Settings.services.url + '/api/gamification/actions', action, {
                    headers: {
                        'X-Fidem-AccessApiKey': Settings.services.accessApiKey}
                });
            }

            geolocation.getLocation().then(function (data) {
                adjustAction();

                action.coordinates = { lat: data.coords.latitude, long: data.coords.longitude };

                postAction();
            }, function (err) {
                // FIXME: (SG) Must have a better way to detect the presence or not of geolocatiuon
                // Fallback to standard call if no geolcation available
                adjustAction();
                postAction();
            });
        }
    };
}]);
