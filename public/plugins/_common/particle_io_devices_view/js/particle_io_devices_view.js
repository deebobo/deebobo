/**
 * Created by elastetic.dev on 5/06/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */



angular.module("elastetic").controller('particlIODevicesViewController',
    ['$scope', 'messages', '$http', '$stateParams', 'viewData', 'toolbar', 'UserService', '$state',
    function ($scope, messages, $http, $stateParams, viewData, toolbar, UserService, $state) {

        toolbar.title = "particle.io devices";
        toolbar.buttons = [];

        $scope.devices = [];

        $scope.selected = [];                       //the selected devices.


        var particle = new Particle();

		console.log("something fishy going on here");
        $http({method: 'GET', url: '/api/site/' + $stateParams.site + '/connection'})
            .then(function (response) {
                    for(i=0; i < response.data.length; i++){
						var connection = response.data[i];
                        if(connection.plugin.name === "particle_io" && UserService.isAuthorizedFor(connection)){	//only list particle.io resources and only when current user is allowed, when not allowed, we get errors, taht we don't want.
                            if( "content" in connection && "token" in connection.content){
                                particle.listDevices({ auth: connection.content.token }).then(
                                    function(result){
                                        if(result.statusCode === 200){
                                            result.body.forEach(element => element.connection = connection);
                                            $scope.devices.push.apply($scope.devices, result.body);
                                        }
                                    },
                                    function(err){
                                        messages.error(err);
                                    }
                                );
                            }
                            else{
                                messages.error("invalid particle.io connection definition found in: " + response.data[i].name);
                            }
                        }
                    }
                    $scope.gridDef.data = $scope.devices;
                },
                function (response) {
                    messages.error(response.data);
                }
            );

		$scope.gridDef = {
			enableSorting: true,
			columnDefs: [
			  { field: 'name' },
			  { field: 'status' },
			  { field: 'connected' },
			  { field: 'last_heard' },
			  { field: 'cellular' },
			  { field: 'current_build_target' },
			  { field: 'last_ip_address' },
			  { field: 'product_id' },
                { name: 'actions',
                    cellTemplate:'<div style="margin-top: 4px" flex><a style="cursor:pointer;" ng-click="grid.appScope.gridRowClick(row)">details</a></div>' }
			],
            enableFullRowSelection: true,
            enableRowSelection: true,
            multiSelect: false,
            enableRowHeaderSelection: false,
			onRegisterApi: function( gridApi ) {
			  $scope.gridApi = gridApi;					//need this reference if we want to do something with the api on this grid from javascript.
			}
		  };


        $scope.gridRowClick = row => {
            $state.go( 'site.page.view.connection_and_details',
                        {   site: $stateParams.site,
                            page: $stateParams.page || self.homepage,
                            view: "particle_io_device_details_view",
                            connection: row.entity.connection._id,
                            details: row.entity.id });
            // or maybe $location.path(row.url)?
        };

    }]);

//console.log("w