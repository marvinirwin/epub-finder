"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Fragment = require("./fragment");

var Track = (function () {
  _createClass(Track, null, [{
    key: "silence",
    value: function silence(duration) {
      return new Track([new Fragment(0, 0, duration)], duration);
    }
  }]);

  function Track() {
    var fragments = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var duration = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, Track);

    this.fragments = fragments;
    if (fragments.length !== 0 && duration === 0) {
      duration = fragments.reduce(function (duration, fragment) {
        return duration + fragment.duration;
      }, 0);
    }
    this.duration = duration;
  }

  _createClass(Track, [{
    key: "gain",
    value: function gain(_gain) {
      return new Track(this.fragments.map(function (fragment) {
        return fragment.clone({ gain: fragment.gain * _gain });
      }), this.duration);
    }
  }, {
    key: "pan",
    value: function pan(_pan) {
      return new Track(this.fragments.map(function (fragment) {
        return fragment.clone({ pan: fragment.pan + _pan });
      }), this.duration);
    }
  }, {
    key: "reverse",
    value: function reverse() {
      return new Track(this.fragments.map(function (fragment) {
        return fragment.clone({ reverse: !fragment.reverse });
      }).reverse(), this.duration);
    }
  }, {
    key: "pitch",
    value: function pitch(rate) {
      return new Track(this.fragments.map(function (fragment) {
        return fragment.clone({ pitch: fragment.pitch * rate, stretch: false });
      }), 0); // need to recalculate the duration
    }
  }, {
    key: "stretch",
    value: function stretch(rate) {
      return new Track(this.fragments.map(function (fragment) {
        return fragment.clone({ pitch: fragment.pitch * rate, stretch: true });
      }), 0); // need to recalculate the duration
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Track(this.fragments.slice(), this.duration);
    }
  }, {
    key: "slice",
    value: function slice(beginTime, duration) {
      var newInstance = new Track();
      var remainingStart = Math.max(0, beginTime);
      var remainingDuration = duration;

      for (var i = 0; 0 < remainingDuration && i < this.fragments.length; i++) {
        if (this.fragments[i].duration <= remainingStart) {
          remainingStart -= this.fragments[i].duration;
        } else {
          var fragment = this.fragments[i].slice(remainingStart, remainingDuration);

          newInstance.addFragment(fragment);

          remainingStart = 0;
          remainingDuration -= fragment.duration;
        }
      }

      return newInstance;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.fragments.map(function (fragment) {
        return fragment.toJSON();
      });
    }
  }, {
    key: "addFragment",
    value: function addFragment(fragment) {
      if (fragment instanceof Fragment && 0 < fragment.duration) {
        this.fragments.push(fragment);
        this.duration += fragment.duration;
      }
      return this;
    }
  }, {
    key: "append",
    value: function append(track) {
      var _this = this;

      if (track instanceof Track) {
        track.fragments.forEach(function (fragment) {
          _this.addFragment(fragment);
        });
      }
      return this;
    }
  }]);

  return Track;
})();

module.exports = Track;