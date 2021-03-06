/**
 * Created by elastetic.dev on 9/06/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */

'use strict';


elastetic.factory('pluginService',
    ['$q', '$http',  function ($q, $http) {

        var plugins = {};                                               //stores all the already loaded js scripts.

        return ({                                                       // return available functions for use in controllers
            load: load,
            loadSingle: loadSingle,
        });

        /**
         * make certain that the source file is loaded.
         * @param path {string} the path and name of the js file to load. The path is a relative path to the public section of the application.
         * @returns {Bluebird<R>}
         */
        function loadSingle(path){
            if(path in plugins)
                return plugins[path].promise;
            else {
                var deferred = $q.defer();

                var container = document.getElementsByTagName('head')[0];
                var injector = new Injector({container: container});

                injector.oncomplete = function() {
                    deferred.resolve();
                };

                var toInject = '<script type="text/javascript" src="' + path + '"></script>';
                injector.insert(toInject);
                plugins[path] = deferred;
                return deferred.promise;
            }
        }

        function loadCss(path){
            if(path in plugins)
                return plugins[path].promise;
            else {
                var deferred = $q.defer();

                var container = document.getElementsByTagName('head')[0];
                var injector = new Injector({container: container});

                injector.oncomplete = function() {
                    deferred.resolve();
                };

                var toInject = '<link rel="stylesheet" type="text/css" href="' + path + '"></link>';
                injector.insert(toInject);
                plugins[path] = deferred;
                return deferred.promise;
            }
        }

        /**
         * make certain that the source file is loaded.
         * @param input {string or List<string>} the path and name of the js file(s) to load. The path is a relative path to the public section of the application.
         * @returns {Bluebird<R>}
         */
        function load(section){
            var deferred = $q.defer();
            var promises = [];
            for(var i = 0; i < section.scripts.length; i++){
                promises.push(loadSingle(section.scripts[i]));
            }



            for(var i = 0; i < section.css.length; i++){
                promises.push(loadCss(section.css[i]));
            }
            $q.all(promises).then(function() {

                deferred.resolve();
            });
            return deferred.promise;

        }

    }]
);