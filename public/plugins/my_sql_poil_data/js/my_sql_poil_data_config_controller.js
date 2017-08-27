/**
 * Created by Deebobo.dev on 19/08/2017.
 * copyright 2017 Deebobo.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */


angular.module("deebobo").controller('MySqlHistoricalDataConfigController',
    ['$scope', '$controller', 'messages', '$mdDialog', '$http', '$stateParams',
        function($scope, $controller, messages, $mdDialog, $http, $stateParams) {
            //angular.extend(this, $controller('adminConnectionsController', {$scope: $scope}));  -> no longer needed, configs are now rapped inside pluginConfigurator directive.

            $scope.tables = [];

            //get data from site for scope
            //--------------------------------------------------------------------------------------
            $http({method: 'GET', url: '/api/site/' + $stateParams.site + '/connection'})      //get the list of projects for this user, for the dlgopen (not ideal location, for proto only
                .then(function (response) {
                        $scope.tables.push.apply($scope.tables, response.data);
                    },
                    function (response) {
                        messages.error(response.data);
                    }
                );


        }]);
