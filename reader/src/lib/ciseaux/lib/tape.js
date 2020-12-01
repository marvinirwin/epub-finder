"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint no-use-before-define: 0 */

var AudioData = require("audiodata");
var Track = require("./track");
var Fragment = require("./fragment");
var config = require("./config");
var renderer = require("./renderer");

var util = {};

var Tape = (function () {
  _createClass(Tape, null, [{
    key: "silence",
    value: function silence(duration) {
      return new Tape(1, config.sampleRate).silence(duration);
    }
  }, {
    key: "concat",
    value: function concat() {
      var _ref;

      return (_ref = new Tape(1, config.sampleRate)).concat.apply(_ref, arguments);
    }
  }, {
    key: "mix",
    value: function mix() {
      var _ref2;

      var newInstance = (_ref2 = new Tape(1, config.sampleRate)).mix.apply(_ref2, arguments);

      if (1 < newInstance.tracks.length) {
        newInstance.tracks.shift(); // remove first empty track
      }

      return newInstance;
    }
  }]);

  function Tape(arg1, arg2) {
    _classCallCheck(this, Tape);

    if (AudioData.isAudioData(arg1)) {
      return new TransferredTape(arg1);
    }

    this.tracks = [new Track()];
    this._numberOfChannels = Math.max(1, arg1 | 0);
    this._sampleRate = Math.max(0, arg2 | 0) || config.sampleRate;
  }

  _createClass(Tape, [{
    key: "gain",
    value: function gain() {
      var _gain = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      _gain = util.toNumber(_gain);

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.gain(_gain);
      });

      return newInstance;
    }
  }, {
    key: "pan",
    value: function pan() {
      var _pan = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      _pan = util.toNumber(_pan);

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.pan(_pan);
      });

      return newInstance;
    }
  }, {
    key: "reverse",
    value: function reverse() {
      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.reverse();
      });

      return newInstance;
    }
  }, {
    key: "pitch",
    value: function pitch() {
      var rate = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      rate = Math.max(0, util.toNumber(rate));

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.pitch(rate);
      });

      return newInstance;
    }
  }, {
    key: "stretch",
    value: function stretch() {
      var rate = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      rate = Math.max(0, util.toNumber(rate));

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.stretch(rate);
      });

      return newInstance;
    }
  }, {
    key: "clone",
    value: function clone() {
      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.clone();
      });

      return newInstance;
    }
  }, {
    key: "silence",
    value: function silence() {
      var duration = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      duration = Math.max(0, util.toNumber(duration));

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      if (0 < duration) {
        newInstance.tracks = this.tracks.map(function () {
          return Track.silence(duration);
        });
      }

      return newInstance;
    }
  }, {
    key: "concat",
    value: function concat() {
      for (var _len = arguments.length, tapes = Array(_len), _key = 0; _key < _len; _key++) {
        tapes[_key] = arguments[_key];
      }

      tapes = Array.prototype.concat.apply([], tapes);

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.clone();
      });

      tapes.forEach(function (tape) {
        if (!(tape instanceof Tape && 0 < tape.duration)) {
          return;
        }
        if (newInstance._numberOfChannels < tape._numberOfChannels) {
          newInstance._numberOfChannels = tape._numberOfChannels;
        }
        if (newInstance.numberOfTracks < tape.numberOfTracks) {
          newInstance = util.adjustNumberOfTracks(newInstance, tape.numberOfTracks);
        }
        if (tape.numberOfTracks < newInstance.numberOfTracks) {
          tape = util.adjustNumberOfTracks(tape, newInstance.numberOfTracks);
        }
        tape.tracks.forEach(function (track, index) {
          newInstance.tracks[index].append(track);
        });
      });

      return newInstance;
    }
  }, {
    key: "slice",
    value: function slice() {
      var beginTime = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var duration = arguments.length <= 1 || arguments[1] === undefined ? Infinity : arguments[1];

      beginTime = util.toNumber(beginTime);
      duration = Math.max(0, util.toNumber(duration));

      if (beginTime < 0) {
        beginTime += this.duration;
      }
      beginTime = Math.max(0, beginTime);

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.slice(beginTime, duration);
      });

      return newInstance;
    }
  }, {
    key: "loop",
    value: function loop() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];

      n = Math.max(0, n | 0);

      var tapes = new Array(n);

      for (var i = 0; i < tapes.length; i++) {
        tapes[i] = this;
      }

      return new Tape(this.numberOfChannels, this.sampleRate).concat(tapes);
    }
  }, {
    key: "fill",
    value: function fill() {
      var duration = arguments.length <= 0 || arguments[0] === undefined ? this.duration : arguments[0];

      duration = Math.max(0, util.toNumber(duration));

      var this$duration = this.duration;

      if (this$duration === 0) {
        return this.silence(duration);
      }

      var loopCount = Math.floor(duration / this$duration);
      var remain = duration % this$duration;

      return this.loop(loopCount).concat(this.slice(0, remain));
    }
  }, {
    key: "replace",
    value: function replace() {
      var beginTime = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var duration = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
      var tape = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      beginTime = util.toNumber(beginTime);
      duration = Math.max(0, util.toNumber(duration));

      if (beginTime < 0) {
        beginTime += this.duration;
      }
      beginTime = Math.max(0, beginTime);

      if (typeof tape === "function") {
        tape = tape(this.slice(beginTime, duration));
      }

      return this.slice(0, beginTime).concat(tape, this.slice(beginTime + duration));
    }
  }, {
    key: "split",
    value: function split() {
      var n = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];

      n = Math.max(0, n | 0);

      var tapes = new Array(n);
      var duration = this.duration / n;

      for (var i = 0; i < n; i++) {
        tapes[i] = this.slice(duration * i, duration);
      }

      return tapes;
    }
  }, {
    key: "mix",
    value: function mix() {
      for (var _len2 = arguments.length, tapes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        tapes[_key2] = arguments[_key2];
      }

      tapes = Array.prototype.concat.apply([], tapes);

      var method = undefined;

      if (typeof tapes[tapes.length - 1] === "string") {
        method = tapes.pop();
      }

      var newInstance = new Tape(this.numberOfChannels, this.sampleRate);

      newInstance.tracks = this.tracks.map(function (track) {
        return track.clone();
      });

      tapes.forEach(function (tape) {
        if (!(tape instanceof Tape && 0 < tape.duration)) {
          return;
        }
        if (newInstance._numberOfChannels < tape._numberOfChannels) {
          newInstance._numberOfChannels = tape._numberOfChannels;
        }
        if (newInstance.duration < tape.duration) {
          newInstance = util.adjustDuration(newInstance, tape.duration, method);
        }
        if (tape.duration < newInstance.duration) {
          tape = util.adjustDuration(tape, newInstance.duration, method);
        }
        newInstance.tracks = newInstance.tracks.concat(tape.tracks);
      });

      return newInstance;
    }
  }, {
    key: "render",
    value: function render() {
      if (config.render) {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return config.render.apply(config, [this.toJSON()].concat(args));
      }
      return new Promise(function (resolve, reject) {
        reject(new Error("not implemented"));
      });
    }
  }, {
    key: "dispose",
    value: function dispose() {
      /* subclass responsibility */
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var tracks = this.tracks.map(function (track) {
        return track.toJSON();
      });
      var duration = this.duration;
      var sampleRate = this.sampleRate;
      var numberOfChannels = this.numberOfChannels;
      var usePan = tracks.some(function (fragments) {
        return fragments.some(function (fragment) {
          return fragment.pan !== 0;
        });
      });

      if (usePan) {
        numberOfChannels = Math.max(2, numberOfChannels);
      }

      return { tracks: tracks, duration: duration, sampleRate: sampleRate, numberOfChannels: numberOfChannels };
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return this._sampleRate || config.sampleRate;
    }
  }, {
    key: "length",
    get: function get() {
      return Math.floor(this.duration * this.sampleRate);
    }
  }, {
    key: "duration",
    get: function get() {
      return this.tracks[0].duration;
    }
  }, {
    key: "numberOfChannels",
    get: function get() {
      return this._numberOfChannels;
    }
  }, {
    key: "numberOfTracks",
    get: function get() {
      return this.tracks.length;
    }
  }]);

  return Tape;
})();

var TransferredTape = (function (_Tape) {
  _inherits(TransferredTape, _Tape);

  function TransferredTape(audiodata) {
    _classCallCheck(this, TransferredTape);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TransferredTape).call(this, AudioData.getNumberOfChannels(audiodata), audiodata.sampleRate));

    var duration = AudioData.getDuration(audiodata);

    _this._data = renderer.transfer(audiodata);

    _this.tracks[0].addFragment(new Fragment(_this._data, 0, duration));

    config.sampleRate = config.sampleRate || audiodata.sampleRate;
    return _this;
  }

  _createClass(TransferredTape, [{
    key: "dispose",
    value: function dispose() {
      renderer.dispose(this._data);
    }
  }]);

  return TransferredTape;
})(Tape);

util.toNumber = function (num) {
  return +num || 0;
};

util.adjustNumberOfTracks = function (tape, numberOfTracks) {
  var newInstance = new Tape(tape.numberOfChannels, tape.sampleRate);

  newInstance.tracks = tape.tracks.map(function (track) {
    return track.clone();
  });

  var balance = numberOfTracks - newInstance.numberOfTracks;
  var duration = newInstance.duration;

  for (var i = 0; i < balance; i++) {
    newInstance.tracks.push(Track.silence(duration));
  }

  return newInstance;
};

util.adjustDuration = function (tape, duration, method) {
  if (tape.duration === 0) {
    return tape.silence(duration);
  }
  switch (method) {
    case "fill":
      return tape.fill(duration);
    case "pitch":
      return tape.pitch(tape.duration / duration);
    case "stretch":
      return tape.stretch(tape.duration / duration);
    default:
      /* silence */
      return tape.concat(tape.silence(duration - tape.duration));
  }
};

module.exports = Tape;