"use strict";

var AudioData = require("audiodata");
var Tape = require("./tape");
var config = require("./config");
var renderer = require("./renderer");

var AudioContext = global.AudioContext || global.webkitAudioContext;

function load(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new global.XMLHttpRequest();

    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText));
      }
    };
    xhr.onerror = function () {
      reject(new Error(xhr.statusText));
    };
    xhr.send();
  });
}

function decode(buffer) {
  if (config.context === null) {
    config.context = new AudioContext();
  }
  return new Promise(function (resolve, reject) {
    config.context.decodeAudioData(buffer, function (audioBuffer) {
      resolve(toAudioData(audioBuffer));
    }, reject);
  });
}

function toAudioData(audioBuffer) {
  return AudioData.fromAudioBuffer(audioBuffer);
}

function from(src) {
  if (src instanceof Tape) {
    return Promise.resolve(src.clone());
  }
  if (AudioData.isAudioData(src)) {
    return Promise.resolve(new Tape(src));
  }
  if (src instanceof global.AudioBuffer) {
    return Promise.resolve(new Tape(toAudioData(src)));
  }
  if (config.context === null) {
    config.context = new AudioContext();
  }
  if (src instanceof ArrayBuffer) {
    return decode(src).then(from);
  }
  if (typeof src === "string") {
    return load(src).then(from);
  }
  return Promise.reject(new Error("Invalid arguments"));
}

function render(tape) {
  var numberOfChannels = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  numberOfChannels = Math.max(numberOfChannels, tape.numberOfChannels);

  tape.numberOfChannels = numberOfChannels;

  if (config.context === null) {
    config.context = new AudioContext();
  }

  return renderer.render(tape).then(function (channelData) {
    return AudioData.toAudioBuffer({
      sampleRate: tape.sampleRate,
      channelData: channelData
    }, config.context);
  });
}

module.exports = function () {
  config.load = load;
  config.decode = decode;
  config.from = from;
  config.render = render;
};