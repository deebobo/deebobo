/**
 * Created by elastetic.dev on 5/06/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */
'use strict'
elastetic.controller('adminFunctionsController',
    ['$scope', '$http', 'messages', '$stateParams', '$mdDialog', 'pluginService', '$q', 'toolbar',
        function ($scope, $http, messages, $stateParams, $mdDialog, pluginService, $q, toolbar) {

            //scope vars
            //--------------------------------------------------------------------------------------

            var scope = $scope;                         //make a local copy so the scope can't be screwed up in functions

            toolbar.title = "functions";
            toolbar.buttons = [
                {   tooltip: "add a new function",
                    icon: "fa fa-plus-circle",
                    type: "font-icon",
                    click: function(ev){ $scope.addFunction();}
                }
            ];

            scope.functions = [];

            /**
             * if both the record list and the plugins exist, convert the objects of the recs to the objects
             * of the plugins, so that the selects can work properly.
             * @param recs
             * @param plugins
             */
            function tryConvertPluginRefs(recs, plugins){
                var deferred = $q.defer();
                if(recs && plugins) {
                    var promises = [];
                    for (var i = 0; i < recs.length; i++) {
                        if(recs[i].source){
                            recs[i].template = "plugins/" + recs[i].source.config.partials[0];
                            recs[i].source = plugins.find(function(x){ return x._id === recs[i].source._id; });
                            promises.push(pluginService.load(recs[i].source.config));
                        }
                    }
                    $q.all(promises).then(function() {
                        deferred.resolve();
                    });
                }
                else
                    deferred.resolve();
                return deferred.promise;
            }

            function tryConvertPluginRef(rec, plugins){
                var deferred = $q.defer();
                if(rec && plugins) {
                    if(rec.source){
                        rec.template = "plugins/" + rec.source.config.partials[0];
                        rec.source = plugins.find(function(x){ return x._id === rec.source._id; });
                        pluginService.load(rec.source.config).then(function() {
                            deferred.resolve();
                        });
                    }
                }
                else
                    deferred.resolve();
                return deferred.promise;
            }

            //get data from site for scope
            //--------------------------------------------------------------------------------------
            $http({method: 'GET', url: encodeURI('/api/site/' + $stateParams.site + '/function')})      //get the list of projects for this user, for the dlgopen (not ideal location, for proto only
                .then(function (response) {
                        tryConvertPluginRefs(response.data, scope.functionPlugins).then(function(){
                            scope.functions.push.apply(scope.functions, response.data);
                        });
                    },
                    function (response) {
                        messages.error(response.data);
                    }
                );

            $http({method: 'GET', url: encodeURI('/api/site/' + $stateParams.site + '/plugin/function')})      //get the list of projects for this user, for the dlgopen (not ideal location, for proto only
                .then(function (response) {
                        tryConvertPluginRefs(scope.functions, response.data).then(function(){
                            scope.functionPlugins = response.data;
                        });
                    },
                    function (response) {
                        messages.error(response.data);
                    }
                );


            //html callbacks.
            //--------------------------------------------------------------------------------------
            scope.addFunction = function(){
                scope.functions.push({name: "", plugin: null, isOpen: true, needsSave: true, isNew: true});
            };


            scope.save = function(func){
                if(func.isNew === true){
                    $http({method: 'POST', url: encodeURI('/api/site/' + $stateParams.site + '/function'), data: func})      //get the list of groups that can view
                        .then(function (response) {
                                angular.copy(response.data, func);      //make a copy so we have the id and possibly other values that were generated (ex: token for particle)
                                tryConvertPluginRef(func, scope.functionPlugins);
                                func.needsSave = false;
                                func.isNew = false;
                            },
                            function (response) {
                                messages.error(response.data);
                            }
                        );
                }
                else {
                    $http({method: 'PUT', url: encodeURI('/api/site/' + $stateParams.site + '/function/' + func._id), data: func})      //get the list of groups that can view
                        .then(function (response) {
                                angular.copy(response.data, func);      //make a copy so we have the id and possibly other values that were generated (ex: token for particle)
                                tryConvertPluginRef(func, scope.functionPlugins);
                                func.needsSave = false;
                            },
                            function (response) {
                                messages.error(response.data);
                            }
                        );
                }
            };

            scope.delete = function(index, func, ev){
                var list = scope.functions;
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    .title('Delete')
                    .textContent('Are you certain you want to delete this func?.')
                    .ariaLabel('delete')
                    .targetEvent(ev)
                    .ok('yes')
                    .cancel('no');

                $mdDialog.show(confirm).then(function() {
                    if( !func.isNew ){                                                  //its a real record, needs to be deleted from the server.
                        $http({method: 'DELETE', url: encodeURI('/api/site/' + $stateParams.site + '/function/' + func._id)})      //get the list of groups that can view
                            .then(function (response) {
                                    list.splice(index, 1);
                                },
                                function (response) {
                                    messages.error(response.data);
                                }
                            );
                    }
                    else
                        list.splice(index, 1);

                }, function() {

                });


            };

        }
    ]
);
