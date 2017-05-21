/**
 * Created by Deebobo.dev on 21/05/2017.
 * copyright 2017 Debobo.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Michele Balistreri
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var util = require('util');
var events = require('events');
var fs = require('fs');
var path = require('path');
const winston = require('winston');

/**
 * Creates a PluginLoader object.
 * @param {Array} modulePath
 */
exports.PluginLoader = function(modulePath) {
    events.EventEmitter.call(this);
    Object.defineProperty(this, 'loadedModules', { value: {} });
    Object.defineProperty(this, 'modulePath', { value: modulePath });
}

util.inherits(exports.PluginLoader, events.EventEmitter);

exports.PluginLoader.prototype.on = function(event, handler) {

    // delegate to EventEmitter
    return events.EventEmitter.prototype.on.call(this, event, handler);
};

exports.PluginLoader.prototype.loadFiles = function(dir, files){
    for(let moduleName of files){
        if (moduleName.charAt(0) != '.') {
            if(fs.lstatSync(path.join(dir, moduleName)).isDirectory() == false){
                if (this.loadedModules[moduleName] === undefined) {
                    try {
                        winston.log("info", "plugin found: ", moduleName);
                        loadModule(this, dir, moduleName);
                    } catch (err) {
                        winston.log("error", "failed to load plugin: ", moduleName, err);
                    }
                }
            }
            else{
                let newDir = path.join(dir, moduleName);
                let files = fs.readdirSync(newDir);
                this.loadFiles(newDir, files);
            }
        }
    }
};

/**
 * Discovers new/removed plugins and loads/unloads them.
 */
exports.PluginLoader.prototype.discover = function(emitAllPluginsLoaded) {
    for (let moduleDirectory of this.modulePath) {
        let files = fs.readdirSync(moduleDirectory);
        this.loadFiles(moduleDirectory, files);
    }
    winston.log("info", "all plugins loaded");
};

/**
 * Starts monitoring the directories from the modulePath property for changes.
 */
exports.PluginLoader.prototype.startMonitoring = function() {
    var pluginLoader = this;

    if (this._watchers != null) {
        return;
    }

    this._watchers = [];
    this.modulePath.forEach(function(moduleDirectory) {
        // the watch method is documented not to be reliably
        // report the filename argument, so we ignore it and start
        // a full blown discovery as soon as something happens
        pluginLoader._watchers.push(fs.watch(moduleDirectory, { persistent: false }, function(event, filename) {
            pluginLoader.discover();
        }));
    });

    this.discover();
}

/**
 * Stops monitoring.
 */
exports.PluginLoader.prototype.stopMonitoring = function() {
    var pluginLoader = this;

    if (this._watchers == null) {
        return;
    }

    this._watchers.forEach(function(watcher) {
        watcher.close();
    });

    this._watchers = null;
}

function detectRemovedModules(pluginLoader, allFoundModules) {
    for(plugin in pluginLoader.loadedModules) {
        if (allFoundModules.indexOf(plugin) == -1) {
            process.nextTick(unloadModule.bind(undefined, pluginLoader, plugin));
        }
    }
}

function loadModule(pluginLoader, moduleDirectory, moduleName) {
    var loadedPlugin = require(path.join(moduleDirectory, moduleName));

    if (typeof(loadedPlugin.load) == 'function') {
        loadedPlugin.load();
    }

    pluginLoader.loadedModules[moduleName] = loadedPlugin;
    pluginLoader.emit('pluginLoaded', moduleName, loadedPlugin);
}

function unloadModule(pluginLoader, moduleName) {
    var unloadedPlugin = pluginLoader.loadedModules[moduleName];
    delete pluginLoader.loadedModules[moduleName];

    if (typeof(unloadedPlugin.unload) == 'function') {
        unloadedPlugin.unload();
    }

    pluginLoader.emit('pluginUnloaded', moduleName, unloadedPlugin);
}
