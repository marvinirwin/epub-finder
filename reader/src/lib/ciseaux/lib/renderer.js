"use strict";
/* eslint import/no-webpack-loader-syntax:0 */
const RenderWorker = require('Worker-loader?name=dist/[name].js!./render-worker');

const worker = new RenderWorker();
var __callbacks = [];
var __data = 1; // data 0 is reserved for silence

worker.onmessage = function (e) {
  var channleData = e.data.buffers.map(function (buffer) {
    return new Float32Array(buffer);
  });

  __callbacks[e.data.callbackId](channleData);
  __callbacks[e.data.callbackId] = null;
};

module.exports = {
  transfer: function transfer(audiodata) {
    var data = __data++;
    var buffers = audiodata.channelData.map(function (array) {
      return array.buffer;
    });

    worker.postMessage({ type: "transfer", data: data, buffers: buffers }, buffers);

    return data;
  },
  dispose: function dispose(data) {
    worker.postMessage({ type: "dispose", data: data });
  },
  render: function render(tape) {
    var callbackId = __callbacks.length;

    worker.postMessage({ type: "render", tape: tape, callbackId: callbackId });

    return new Promise(function (resolve) {
      __callbacks[callbackId] = resolve;
    });
  },
};