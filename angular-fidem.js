'use strict';

angular.module('angular-fidem').factory('FidemServices', ['$http', 'Settings', 'geolocation', function ($http, Settings, geolocation) {
    return {
        logAction: function (action) {
            var logAction = action;

            geolocation.getLocation().then(function (data) {
                logAction.member_id = (window.user) ? window.user.fidem_member_id : null;
                logAction.session_id = (window.fidemSessionId) ? window.fidemSessionId : null;
                logAction.coordinates = { lat: data.coords.latitude, long: data.coords.longitude };

                $http.post(Settings.services.url + '/api/gamification/actions', logAction, {
                    headers: {
                        'X-Fidem-AccessApiKey': Settings.services.accessApiKey}
                });
            }, function (err) {
                console.log(err);

                logAction.member_id = (window.user) ? window.user.fidem_member_id : null;
                logAction.session_id = (window.fidemSessionId) ? window.fidemSessionId : null;

                $http.post(Settings.services.url + '/api/gamification/actions', logAction, {
                    headers: {
                        'X-Fidem-AccessApiKey': Settings.services.accessApiKey}
                });
            });
        }
    };
}]);
