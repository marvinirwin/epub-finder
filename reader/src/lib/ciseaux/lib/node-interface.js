"use strict";

var fs = require("fs");
var WavDecoder = require("wav-decoder");
var WavEncoder = require("wav-encoder");
var AudioData = require("audiodata");
var Tape = require("./tape");
var config = require("./config");
var renderer = require("./renderer");

function load(filepath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filepath, function (err, buffer) {
      if (err) {
        reject(err);
      }
      resolve(buffer);
    });
  });
}

function decode(buffer) {
  return WavDecoder.decode(buffer);
}

function from(src) {
  if (src instanceof Tape) {
    return Promise.resolve(src.clone());
  }
  if (AudioData.isAudioData(src)) {
    return Promise.resolve(new Tape(src));
  }
  if (src instanceof Buffer) {
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

  return renderer.render(tape).then(function (channelData) {
    return WavEncoder.encode({
      sampleRate: tape.sampleRate,
      channelData: channelData
    });
  });
}

module.exports = function () {
  config.load = load;
  config.decode = decode;
  config.from = from;
  config.render = render;
};