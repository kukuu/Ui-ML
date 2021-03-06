'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = SpeechRecognition;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function SpeechRecognition(options) {
  var SpeechRecognitionInner = function SpeechRecognitionInner(WrappedComponent) {
    var BrowserSpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition);
    var recognition = BrowserSpeechRecognition ? new BrowserSpeechRecognition() : null;
    var browserSupportsSpeechRecognition = recognition !== null;
    var listening = void 0;
    if (!browserSupportsSpeechRecognition || options && options.autoStart === false) {
      listening = false;
    } else {
      recognition.start();
      listening = true;
    }
    var pauseAfterDisconnect = false;
    var interimTranscript = '';
    var finalTranscript = '';

    return function (_Component) {
      _inherits(SpeechRecognitionContainer, _Component);

      function SpeechRecognitionContainer(props) {
        _classCallCheck(this, SpeechRecognitionContainer);

        var _this = _possibleConstructorReturn(this, (SpeechRecognitionContainer.__proto__ || Object.getPrototypeOf(SpeechRecognitionContainer)).call(this, props));

        _this.disconnect = function (disconnectType) {
          if (recognition) {
            switch (disconnectType) {
              case 'ABORT':
                pauseAfterDisconnect = true;
                recognition.abort();
                break;
              case 'RESET':
                pauseAfterDisconnect = false;
                recognition.abort();
                break;
              case 'STOP':
              default:
                pauseAfterDisconnect = true;
                recognition.stop();
            }
          }
        };

        _this.resetTranscript = function () {
          interimTranscript = '';
          finalTranscript = '';
          _this.disconnect('RESET');
          _this.setState({ interimTranscript: interimTranscript, finalTranscript: finalTranscript });
        };

        _this.startListening = function () {
          if (recognition && !listening) {
            if (!recognition.continuous) {
              _this.resetTranscript();
            }
            try {
              recognition.start();
            } catch (DOMException) {
              // Tried to start recognition after it has already started - safe to swallow this error
            }
            listening = true;
            _this.setState({ listening: listening });
          }
        };

        _this.abortListening = function () {
          listening = false;
          _this.setState({ listening: listening });
          _this.disconnect('ABORT');
        };

        _this.stopListening = function () {
          listening = false;
          _this.setState({ listening: listening });
          _this.disconnect('STOP');
        };

        if (browserSupportsSpeechRecognition) {
          recognition.continuous = options.continuous !== false;
          recognition.interimResults = true;
          recognition.onresult = _this.updateTranscript.bind(_this);
          recognition.onend = _this.onRecognitionDisconnect.bind(_this);
        }

        _this.state = {
          interimTranscript: interimTranscript,
          finalTranscript: finalTranscript,
          listening: listening
        };
        return _this;
      }

      _createClass(SpeechRecognitionContainer, [{
        key: 'onRecognitionDisconnect',
        value: function onRecognitionDisconnect() {
          listening = false;
          if (pauseAfterDisconnect) {
            this.setState({ listening: listening });
          } else if (recognition) {
            if (recognition.continuous) {
              this.startListening();
            } else {
              this.setState({ listening: listening });
            }
          }
          pauseAfterDisconnect = false;
        }
      }, {
        key: 'updateTranscript',
        value: function updateTranscript(event) {
          interimTranscript = '';
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript = this.concatTranscripts(finalTranscript, event.results[i][0].transcript);
            } else {
              interimTranscript = this.concatTranscripts(interimTranscript, event.results[i][0].transcript);
            }
          }
          this.setState({ finalTranscript: finalTranscript, interimTranscript: interimTranscript });
        }
      }, {
        key: 'concatTranscripts',
        value: function concatTranscripts() {
          for (var _len = arguments.length, transcriptParts = Array(_len), _key = 0; _key < _len; _key++) {
            transcriptParts[_key] = arguments[_key];
          }

          return transcriptParts.map(function (t) {
            return t.trim();
          }).join(' ').trim();
        }
      }, {
        key: 'render',
        value: function render() {
          var transcript = this.concatTranscripts(finalTranscript, interimTranscript);

          return _react2.default.createElement(WrappedComponent, _extends({
            resetTranscript: this.resetTranscript,
            startListening: this.startListening,
            abortListening: this.abortListening,
            stopListening: this.stopListening,
            transcript: transcript,
            recognition: recognition,
            browserSupportsSpeechRecognition: browserSupportsSpeechRecognition
          }, this.state, this.props));
        }
      }]);

      return SpeechRecognitionContainer;
    }(_react.Component);
  };

  if (typeof options === 'function') {
    return SpeechRecognitionInner(options);
  } else {
    return SpeechRecognitionInner;
  }
}