"use strict";

var Sequence = require("./sequence");
var Tape = require("./tape");
var config = require("./config");

var AudioContext = global.AudioContext || global.webkitAudioContext;

module.exports = {
  get context() {
    return config.context;
  },
  set context(audioContext) {
    if (AudioContext && audioContext instanceof AudioContext) {
      config.context = audioContext;
    }
  },
  load: function load(filepath) {
    return config.load(filepath);
  },
  decode: function decode(buffer) {
    return config.decode(buffer);
  },

  Sequence: Sequence,
  Tape: Tape,

  from: function from() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (config.from) {
      return config.from.apply(config, args);
    }
    return Promise.resolve(new (Function.prototype.bind.apply(Tape, [null].concat(args)))());
  },
  silence: Tape.silence,
  concat: Tape.concat,
  mix: Tape.mix
};