"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tape = require("./tape");
var config = require("./config");

function getInstrumentFromRegExp(instruments, ch) {
  var keys = Object.keys(instruments);

  for (var i = 0; i < keys.length; i++) {
    var matches = /^\/(.+)?\/(\w*)$/.exec(keys[i]);

    if (matches && new RegExp(matches[1], matches[2]).test(ch)) {
      return instruments[keys[i]];
    }
  }

  return null;
}

function getInstrumentFrom(instruments, ch, index, tape) {
  var instrument = null;

  if (instruments.hasOwnProperty(ch)) {
    instrument = instruments[ch];
  } else {
    instrument = getInstrumentFromRegExp(instruments, ch);
  }

  if (typeof instrument === "function") {
    instrument = instrument(ch, index, tape);
  }

  return instrument instanceof Tape ? instrument : null;
}

var Sequence = (function () {
  function Sequence() {
    var _this = this;

    _classCallCheck(this, Sequence);

    this.pattern = this.instruments = this.durationPerStep = null;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args.forEach(function (arg) {
      if (typeof arg === "string") {
        _this.pattern = arg;
      } else if (typeof arg === "number" || Array.isArray(arg)) {
        _this.durationPerStep = arg;
      } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object") {
        _this.instruments = arg;
      }
    });
  }

  _createClass(Sequence, [{
    key: "apply",
    value: function apply() {
      var pattern = this.pattern;
      var instruments = this.instruments;
      var durationPerStep = this.durationPerStep;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args.forEach(function (arg) {
        if (typeof arg === "string") {
          pattern = arg;
        } else if (typeof arg === "number" || Array.isArray(arg)) {
          durationPerStep = arg;
        } else if ((typeof arg === "undefined" ? "undefined" : _typeof(arg)) === "object") {
          instruments = arg;
        }
      });

      if (pattern === null || instruments === null || durationPerStep === null) {
        return Tape.silence(0);
      }

      var durationPerStepList = Array.isArray(durationPerStep) ? durationPerStep : [durationPerStep];

      return pattern.split("").reduce(function (tape, ch, index) {
        var instrument = getInstrumentFrom(instruments, ch, index, tape);
        var durationPerStep = durationPerStepList[index % durationPerStepList.length];

        durationPerStep = Math.max(0, +durationPerStep || 0);

        if (instrument !== null) {
          if (instrument.duration < durationPerStep) {
            tape = tape.concat(instrument, Tape.silence(durationPerStep - instrument.duration));
          } else {
            tape = tape.concat(instrument.slice(0, durationPerStep));
          }
        } else {
          tape = tape.concat(Tape.silence(durationPerStep));
        }

        return tape;
      }, new Tape(1, config.sampleRate));
    }
  }]);

  return Sequence;
})();

module.exports = Sequence;