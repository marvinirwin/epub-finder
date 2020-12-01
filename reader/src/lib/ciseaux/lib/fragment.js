"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Fragment = (function () {
  function Fragment(data, beginTime, endTime) {
    _classCallCheck(this, Fragment);

    this.data = data;
    this.beginTime = beginTime;
    this.endTime = endTime;
    this.gain = 1;
    this.pan = 0;
    this.reverse = false;
    this.pitch = 1;
    this.stretch = false;
  }

  _createClass(Fragment, [{
    key: "slice",
    value: function slice(beginTime, duration) {
      beginTime = this.beginTime + beginTime * this.pitch;

      var endTime = beginTime + duration * this.pitch;

      beginTime = Math.max(this.beginTime, beginTime);
      endTime = Math.max(beginTime, Math.min(endTime, this.endTime));

      return this.clone({ beginTime: beginTime, endTime: endTime });
    }
  }, {
    key: "clone",
    value: function clone(attributes) {
      var newInstance = new Fragment(this.data, this.beginTime, this.endTime);

      newInstance.gain = this.gain;
      newInstance.pan = this.pan;
      newInstance.reverse = this.reverse;
      newInstance.pitch = this.pitch;
      newInstance.stretch = this.stretch;

      if (attributes) {
        Object.keys(attributes).forEach(function (key) {
          newInstance[key] = attributes[key];
        });
      }

      return newInstance;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        data: this.data,
        beginTime: this.beginTime,
        endTime: this.endTime,
        gain: this.gain,
        pan: this.pan,
        reverse: this.reverse,
        pitch: this.pitch,
        stretch: this.stretch
      };
    }
  }, {
    key: "duration",
    get: function get() {
      return (this.endTime - this.beginTime) / this.pitch;
    }
  }]);

  return Fragment;
})();

module.exports = Fragment;