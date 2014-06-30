/**!
 * totoro-driver-base - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('totoro-driver-base');
var os = require('os');
var SocketClient = require('socket.io-client');

module.exports = TotoroDriver;

function TotoroDriver(options) {
  this._server = options.server;
}

var DEVICES = TotoroDriver.DEVICES = {
  darwin: 'mac',
  win32: 'pc',
  linux: 'linux',
};

var OSNAMES = TotoroDriver.OSNAMES = {
  win32: 'windows',
  darwin: 'macosx',
  linux: 'linux',
};

var proto = TotoroDriver.prototype;

proto.init = function () {
  debug('connecting to %s', this._server);
  this.socket = SocketClient.connect(this._server + '/__labor');
  this.socket.on('connect', function () {
    var ua = this._getUserAgent();
    debug('connect totoro server with User-Agent: %j', ua);
    this.socket.emit('init', ua);
  }.bind(this));

  this.socket.on('add', this.onAdd.bind(this));
  this.socket.on('remove', this.onRemove.bind(this));
  this.socket.on('disconnect', this.onDisconnect.bind(this));
};

proto._getUserAgent = function () {
  var ua = {
    device: { name: DEVICES[process.platform] },
    os: { name: OSNAMES[process.platform], version: os.release() },
    browser: this.getBrowser(),
  };
  return ua;
};

proto.getBrowser = function () {
  throw new Error('Child class must impl this method, return {name, version}');
};

proto.onAdd = function (data) {
  /**
   * structure of data
   * {
   *   orderId: '{{orderId}}',
   *   laborId: '{{laborId}}',
   *   ua: {{specifed browser ua}},
   *   url: {{test runner url}}
   * }
   */
  throw new Error('Child class must impl this method');
};

proto.onRemove = function (data) {
  // the structure is the same as 'add' event's but without the ua
  throw new Error('Child class must impl this method');
};

proto.cleanup = function () {
  throw new Error('Child class must impl this method');
};

proto.onDisconnect = function () {
  debug('socket disconnect, cleanup()');
  this.cleanup();
};
