/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _phoenix = __webpack_require__(1);

	var socket = new _phoenix.Socket("/ws");
	socket.connect();
	var chan = socket.chan("rooms:lobby", {});
	chan.join().receive("ok", function (chan) {
	  console.log("Welcome to Phoenix Chat!");
	});

	var app = {};

	exports["default"] = app;
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports) {

	// Phoenix Channels JavaScript client
	//
	// ## Socket Connection
	//
	// A single connection is established to the server and
	// channels are mulitplexed over the connection.
	// Connect to the server using the `Socket` class:
	//
	//     let socket = new Socket("/ws")
	//     socket.connect()
	//
	// The `Socket` constructor takes the mount point of the socket
	// as well as options that can be found in the Socket docs,
	// such as configuring the `LongPoll` transport, and heartbeat.
	// Socket params can also be passed as an option for default, but
	// overridable channel params to apply to all channels.
	//
	//
	// ## Channels
	//
	// Channels are isolated, concurrent processes on the server that
	// subscribe to topics and broker events between the client and server.
	// To join a channel, you must provide the topic, and channel params for
	// authorization. Here's an example chat room example where `"new_msg"`
	// events are listened for, messages are pushed to the server, and
	// the channel is joined with ok/error matches, and `after` hook:
	//
	//     let chan = socket.chan("rooms:123", {token: roomToken})
	//     chan.on("new_msg", msg => console.log("Got message", msg) )
	//     $input.onEnter( e => {
	//       chan.push("new_msg", {body: e.target.val})
	//           .receive("ok", (message) => console.log("created message", message) )
	//           .receive("error", (reasons) => console.log("create failed", reasons) )
	//           .after(10000, () => console.log("Networking issue. Still waiting...") )
	//     })
	//     chan.join()
	//         .receive("ok", ({messages}) => console.log("catching up", messages) )
	//         .receive("error", ({reason}) => console.log("failed join", reason) )
	//         .after(10000, () => console.log("Networking issue. Still waiting...") )
	//
	//
	// ## Joining
	//
	// Joining a channel with `chan.join(topic, params)`, binds the params to
	// `chan.params`. Subsequent rejoins will send up the modified params for
	// updating authorization params, or passing up last_message_id information.
	// Successful joins receive an "ok" status, while unsuccessful joins
	// receive "error".
	//
	//
	// ## Pushing Messages
	//
	// From the previous example, we can see that pushing messages to the server
	// can be done with `chan.push(eventName, payload)` and we can optionally
	// receive responses from the push. Additionally, we can use
	// `after(millsec, callback)` to abort waiting for our `receive` hooks and
	// take action after some period of waiting.
	//
	//
	// ## Socket Hooks
	//
	// Lifecycle events of the multiplexed connection can be hooked into via
	// `socket.onError()` and `socket.onClose()` events, ie:
	//
	//     socket.onError( () => console.log("there was an error with the connection!") )
	//     socket.onClose( () => console.log("the connection dropped") )
	//
	//
	// ## Channel Hooks
	//
	// For each joined channel, you can bind to `onError` and `onClose` events
	// to monitor the channel lifecycle, ie:
	//
	//     chan.onError( () => console.log("there was an error!") )
	//     chan.onClose( () => console.log("the channel has gone away gracefully") )
	//
	// ### onError hooks
	//
	// `onError` hooks are invoked if the socket connection drops, or the channel
	// crashes on the server. In either case, a channel rejoin is attemtped
	// automatically in an exponential backoff manner.
	//
	// ### onClose hooks
	//
	// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
	// closed on the server, or 2). The client explicitly closed, by calling
	// `chan.leave()`
	//

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
	var CHAN_STATES = {
	  closed: "closed",
	  errored: "errored",
	  joined: "joined",
	  joining: "joining"
	};
	var CHAN_EVENTS = {
	  close: "phx_close",
	  error: "phx_error",
	  join: "phx_join",
	  reply: "phx_reply",
	  leave: "phx_leave"
	};
	var TRANSPORTS = {
	  longpoll: "longpoll",
	  websocket: "websocket"
	};

	var Push = (function () {

	  // Initializes the Push
	  //
	  // chan - The Channel
	  // event - The event, ie `"phx_join"`
	  // payload - The payload, ie `{user_id: 123}`
	  //

	  function Push(chan, event, payload) {
	    _classCallCheck(this, Push);

	    this.chan = chan;
	    this.event = event;
	    this.payload = payload || {};
	    this.receivedResp = null;
	    this.afterHook = null;
	    this.recHooks = [];
	    this.sent = false;
	  }

	  _createClass(Push, [{
	    key: "send",
	    value: function send() {
	      var _this = this;

	      var ref = this.chan.socket.makeRef();
	      this.refEvent = this.chan.replyEventName(ref);
	      this.receivedResp = null;
	      this.sent = false;

	      this.chan.on(this.refEvent, function (payload) {
	        _this.receivedResp = payload;
	        _this.matchReceive(payload);
	        _this.cancelRefEvent();
	        _this.cancelAfter();
	      });

	      this.startAfter();
	      this.sent = true;
	      this.chan.socket.push({
	        topic: this.chan.topic,
	        event: this.event,
	        payload: this.payload,
	        ref: ref
	      });
	    }
	  }, {
	    key: "receive",
	    value: function receive(status, callback) {
	      if (this.receivedResp && this.receivedResp.status === status) {
	        callback(this.receivedResp.response);
	      }

	      this.recHooks.push({ status: status, callback: callback });
	      return this;
	    }
	  }, {
	    key: "after",
	    value: function after(ms, callback) {
	      if (this.afterHook) {
	        throw "only a single after hook can be applied to a push";
	      }
	      var timer = null;
	      if (this.sent) {
	        timer = setTimeout(callback, ms);
	      }
	      this.afterHook = { ms: ms, callback: callback, timer: timer };
	      return this;
	    }

	    // private

	  }, {
	    key: "matchReceive",
	    value: function matchReceive(_ref) {
	      var status = _ref.status;
	      var response = _ref.response;
	      var ref = _ref.ref;

	      this.recHooks.filter(function (h) {
	        return h.status === status;
	      }).forEach(function (h) {
	        return h.callback(response);
	      });
	    }
	  }, {
	    key: "cancelRefEvent",
	    value: function cancelRefEvent() {
	      this.chan.off(this.refEvent);
	    }
	  }, {
	    key: "cancelAfter",
	    value: function cancelAfter() {
	      if (!this.afterHook) {
	        return;
	      }
	      clearTimeout(this.afterHook.timer);
	      this.afterHook.timer = null;
	    }
	  }, {
	    key: "startAfter",
	    value: function startAfter() {
	      var _this2 = this;

	      if (!this.afterHook) {
	        return;
	      }
	      var callback = function callback() {
	        _this2.cancelRefEvent();
	        _this2.afterHook.callback();
	      };
	      this.afterHook.timer = setTimeout(callback, this.afterHook.ms);
	    }
	  }]);

	  return Push;
	})();

	var Channel = (function () {
	  function Channel(topic, params, socket) {
	    var _this3 = this;

	    _classCallCheck(this, Channel);

	    this.state = CHAN_STATES.closed;
	    this.topic = topic;
	    this.params = params || {};
	    this.socket = socket;
	    this.bindings = [];
	    this.joinedOnce = false;
	    this.joinPush = new Push(this, CHAN_EVENTS.join, this.params);
	    this.pushBuffer = [];
	    this.rejoinTimer = new Timer(function () {
	      return _this3.rejoinUntilConnected();
	    }, this.socket.reconnectAfterMs);
	    this.joinPush.receive("ok", function () {
	      _this3.state = CHAN_STATES.joined;
	      _this3.rejoinTimer.reset();
	    });
	    this.onClose(function () {
	      _this3.socket.log("channel", "close " + _this3.topic);
	      _this3.state = CHAN_STATES.closed;
	      _this3.socket.remove(_this3);
	    });
	    this.onError(function (reason) {
	      _this3.socket.log("channel", "error " + _this3.topic, reason);
	      _this3.state = CHAN_STATES.errored;
	      _this3.rejoinTimer.setTimeout();
	    });
	    this.on(CHAN_EVENTS.reply, function (payload, ref) {
	      _this3.trigger(_this3.replyEventName(ref), payload);
	    });
	  }

	  _createClass(Channel, [{
	    key: "rejoinUntilConnected",
	    value: function rejoinUntilConnected() {
	      this.rejoinTimer.setTimeout();
	      if (this.socket.isConnected()) {
	        this.rejoin();
	      }
	    }
	  }, {
	    key: "join",
	    value: function join() {
	      if (this.joinedOnce) {
	        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
	      } else {
	        this.joinedOnce = true;
	      }
	      this.sendJoin();
	      return this.joinPush;
	    }
	  }, {
	    key: "onClose",
	    value: function onClose(callback) {
	      this.on(CHAN_EVENTS.close, callback);
	    }
	  }, {
	    key: "onError",
	    value: function onError(callback) {
	      this.on(CHAN_EVENTS.error, function (reason) {
	        return callback(reason);
	      });
	    }
	  }, {
	    key: "on",
	    value: function on(event, callback) {
	      this.bindings.push({ event: event, callback: callback });
	    }
	  }, {
	    key: "off",
	    value: function off(event) {
	      this.bindings = this.bindings.filter(function (bind) {
	        return bind.event !== event;
	      });
	    }
	  }, {
	    key: "canPush",
	    value: function canPush() {
	      return this.socket.isConnected() && this.state === CHAN_STATES.joined;
	    }
	  }, {
	    key: "push",
	    value: function push(event, payload) {
	      if (!this.joinedOnce) {
	        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use chan.join() before pushing events";
	      }
	      var pushEvent = new Push(this, event, payload);
	      if (this.canPush()) {
	        pushEvent.send();
	      } else {
	        this.pushBuffer.push(pushEvent);
	      }

	      return pushEvent;
	    }

	    // Leaves the channel
	    //
	    // Unsubscribes from server events, and
	    // instructs channel to terminate on server
	    //
	    // Triggers onClose() hooks
	    //
	    // To receive leave acknowledgements, use the a `receive`
	    // hook to bind to the server ack, ie:
	    //
	    //     chan.leave().receive("ok", () => alert("left!") )
	    //
	  }, {
	    key: "leave",
	    value: function leave() {
	      var _this4 = this;

	      return this.push(CHAN_EVENTS.leave).receive("ok", function () {
	        _this4.log("channel", "leave " + _this4.topic);
	        _this4.trigger(CHAN_EVENTS.close, "leave");
	      });
	    }

	    // Overridable message hook
	    //
	    // Receives all events for specialized message handling
	  }, {
	    key: "onMessage",
	    value: function onMessage(event, payload, ref) {}

	    // private

	  }, {
	    key: "isMember",
	    value: function isMember(topic) {
	      return this.topic === topic;
	    }
	  }, {
	    key: "sendJoin",
	    value: function sendJoin() {
	      this.state = CHAN_STATES.joining;
	      this.joinPush.send();
	    }
	  }, {
	    key: "rejoin",
	    value: function rejoin() {
	      this.sendJoin();
	      this.pushBuffer.forEach(function (pushEvent) {
	        return pushEvent.send();
	      });
	      this.pushBuffer = [];
	    }
	  }, {
	    key: "trigger",
	    value: function trigger(triggerEvent, payload, ref) {
	      this.onMessage(triggerEvent, payload, ref);
	      this.bindings.filter(function (bind) {
	        return bind.event === triggerEvent;
	      }).map(function (bind) {
	        return bind.callback(payload, ref);
	      });
	    }
	  }, {
	    key: "replyEventName",
	    value: function replyEventName(ref) {
	      return "chan_reply_" + ref;
	    }
	  }]);

	  return Channel;
	})();

	exports.Channel = Channel;

	var Socket = (function () {

	  // Initializes the Socket
	  //
	  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
	  //                                               "wss://example.com"
	  //                                               "/ws" (inherited host & protocol)
	  // opts - Optional configuration
	  //   transport - The Websocket Transport, ie WebSocket, Phoenix.LongPoll.
	  //               Defaults to WebSocket with automatic LongPoll fallback.
	  //   params - The defaults for all channel params, ie `{user_id: userToken}`
	  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
	  //   reconnectAfterMs - The optional function that returns the millsec
	  //                      reconnect interval. Defaults to stepped backoff of:
	  //
	  //     function(tries){
	  //       return [1000, 5000, 10000][tries - 1] || 10000
	  //     }
	  //
	  //   logger - The optional function for specialized logging, ie:
	  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
	  //
	  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
	  //                        Defaults to 20s (double the server long poll timer).
	  //
	  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
	  //

	  function Socket(endPoint) {
	    var _this5 = this;

	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    _classCallCheck(this, Socket);

	    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
	    this.channels = [];
	    this.sendBuffer = [];
	    this.ref = 0;
	    this.transport = opts.transport || window.WebSocket || LongPoll;
	    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
	    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
	      return [1000, 5000, 10000][tries - 1] || 10000;
	    };
	    this.reconnectTimer = new Timer(function () {
	      return _this5.connect();
	    }, this.reconnectAfterMs);
	    this.logger = opts.logger || function () {}; // noop
	    this.longpollerTimeout = opts.longpollerTimeout || 20000;
	    this.params = opts.params || {};
	    this.endPoint = "" + endPoint;
	  }

	  _createClass(Socket, [{
	    key: "protocol",
	    value: function protocol() {
	      return location.protocol.match(/^https/) ? "wss" : "ws";
	    }
	  }, {
	    key: "endPointURL",
	    value: function endPointURL() {
	      var uri = Ajax.appendParams(this.endPoint, this.params);
	      if (uri.charAt(0) !== "/") {
	        return uri;
	      }
	      if (uri.charAt(1) === "/") {
	        return this.protocol() + ":" + uri;
	      }

	      return this.protocol() + "://" + location.host + uri;
	    }
	  }, {
	    key: "disconnect",
	    value: function disconnect(callback, code, reason) {
	      if (this.conn) {
	        this.conn.onclose = function () {}; // noop
	        if (code) {
	          this.conn.close(code, reason || "");
	        } else {
	          this.conn.close();
	        }
	        this.conn = null;
	      }
	      callback && callback();
	    }
	  }, {
	    key: "connect",
	    value: function connect() {
	      var _this6 = this;

	      this.disconnect(function () {
	        _this6.conn = new _this6.transport(_this6.endPointURL());
	        _this6.conn.timeout = _this6.longpollerTimeout;
	        _this6.conn.onopen = function () {
	          return _this6.onConnOpen();
	        };
	        _this6.conn.onerror = function (error) {
	          return _this6.onConnError(error);
	        };
	        _this6.conn.onmessage = function (event) {
	          return _this6.onConnMessage(event);
	        };
	        _this6.conn.onclose = function (event) {
	          return _this6.onConnClose(event);
	        };
	      });
	    }

	    // Logs the message. Override `this.logger` for specialized logging. noops by default
	  }, {
	    key: "log",
	    value: function log(kind, msg, data) {
	      this.logger(kind, msg, data);
	    }

	    // Registers callbacks for connection state change events
	    //
	    // Examples
	    //
	    //    socket.onError(function(error){ alert("An error occurred") })
	    //
	  }, {
	    key: "onOpen",
	    value: function onOpen(callback) {
	      this.stateChangeCallbacks.open.push(callback);
	    }
	  }, {
	    key: "onClose",
	    value: function onClose(callback) {
	      this.stateChangeCallbacks.close.push(callback);
	    }
	  }, {
	    key: "onError",
	    value: function onError(callback) {
	      this.stateChangeCallbacks.error.push(callback);
	    }
	  }, {
	    key: "onMessage",
	    value: function onMessage(callback) {
	      this.stateChangeCallbacks.message.push(callback);
	    }
	  }, {
	    key: "onConnOpen",
	    value: function onConnOpen() {
	      var _this7 = this;

	      this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
	      this.flushSendBuffer();
	      this.reconnectTimer.reset();
	      if (!this.conn.skipHeartbeat) {
	        clearInterval(this.heartbeatTimer);
	        this.heartbeatTimer = setInterval(function () {
	          return _this7.sendHeartbeat();
	        }, this.heartbeatIntervalMs);
	      }
	      this.stateChangeCallbacks.open.forEach(function (callback) {
	        return callback();
	      });
	    }
	  }, {
	    key: "onConnClose",
	    value: function onConnClose(event) {
	      this.log("transport", "close", event);
	      this.triggerChanError();
	      clearInterval(this.heartbeatTimer);
	      this.reconnectTimer.setTimeout();
	      this.stateChangeCallbacks.close.forEach(function (callback) {
	        return callback(event);
	      });
	    }
	  }, {
	    key: "onConnError",
	    value: function onConnError(error) {
	      this.log("transport", error);
	      this.triggerChanError();
	      this.stateChangeCallbacks.error.forEach(function (callback) {
	        return callback(error);
	      });
	    }
	  }, {
	    key: "triggerChanError",
	    value: function triggerChanError() {
	      this.channels.forEach(function (chan) {
	        return chan.trigger(CHAN_EVENTS.error);
	      });
	    }
	  }, {
	    key: "connectionState",
	    value: function connectionState() {
	      switch (this.conn && this.conn.readyState) {
	        case SOCKET_STATES.connecting:
	          return "connecting";
	        case SOCKET_STATES.open:
	          return "open";
	        case SOCKET_STATES.closing:
	          return "closing";
	        default:
	          return "closed";
	      }
	    }
	  }, {
	    key: "isConnected",
	    value: function isConnected() {
	      return this.connectionState() === "open";
	    }
	  }, {
	    key: "remove",
	    value: function remove(chan) {
	      this.channels = this.channels.filter(function (c) {
	        return !c.isMember(chan.topic);
	      });
	    }
	  }, {
	    key: "chan",
	    value: function chan(topic) {
	      var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	      var mergedParams = {};
	      for (var key in this.params) {
	        mergedParams[key] = this.params[key];
	      }
	      for (var key in chanParams) {
	        mergedParams[key] = chanParams[key];
	      }

	      var chan = new Channel(topic, mergedParams, this);
	      this.channels.push(chan);
	      return chan;
	    }
	  }, {
	    key: "push",
	    value: function push(data) {
	      var _this8 = this;

	      var topic = data.topic;
	      var event = data.event;
	      var payload = data.payload;
	      var ref = data.ref;

	      var callback = function callback() {
	        return _this8.conn.send(JSON.stringify(data));
	      };
	      this.log("push", topic + " " + event + " (" + ref + ")", payload);
	      if (this.isConnected()) {
	        callback();
	      } else {
	        this.sendBuffer.push(callback);
	      }
	    }

	    // Return the next message ref, accounting for overflows
	  }, {
	    key: "makeRef",
	    value: function makeRef() {
	      var newRef = this.ref + 1;
	      if (newRef === this.ref) {
	        this.ref = 0;
	      } else {
	        this.ref = newRef;
	      }

	      return this.ref.toString();
	    }
	  }, {
	    key: "sendHeartbeat",
	    value: function sendHeartbeat() {
	      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
	    }
	  }, {
	    key: "flushSendBuffer",
	    value: function flushSendBuffer() {
	      if (this.isConnected() && this.sendBuffer.length > 0) {
	        this.sendBuffer.forEach(function (callback) {
	          return callback();
	        });
	        this.sendBuffer = [];
	      }
	    }
	  }, {
	    key: "onConnMessage",
	    value: function onConnMessage(rawMessage) {
	      var msg = JSON.parse(rawMessage.data);
	      var topic = msg.topic;
	      var event = msg.event;
	      var payload = msg.payload;
	      var ref = msg.ref;

	      this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
	      this.channels.filter(function (chan) {
	        return chan.isMember(topic);
	      }).forEach(function (chan) {
	        return chan.trigger(event, payload, ref);
	      });
	      this.stateChangeCallbacks.message.forEach(function (callback) {
	        return callback(msg);
	      });
	    }
	  }]);

	  return Socket;
	})();

	exports.Socket = Socket;

	var LongPoll = (function () {
	  function LongPoll(endPoint) {
	    _classCallCheck(this, LongPoll);

	    this.endPoint = null;
	    this.token = null;
	    this.sig = null;
	    this.skipHeartbeat = true;
	    this.onopen = function () {}; // noop
	    this.onerror = function () {}; // noop
	    this.onmessage = function () {}; // noop
	    this.onclose = function () {}; // noop
	    this.pollEndpoint = this.normalizeEndpoint(endPoint);
	    this.readyState = SOCKET_STATES.connecting;

	    this.poll();
	  }

	  _createClass(LongPoll, [{
	    key: "normalizeEndpoint",
	    value: function normalizeEndpoint(endPoint) {
	      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
	    }
	  }, {
	    key: "endpointURL",
	    value: function endpointURL() {
	      return Ajax.appendParams(this.pollEndpoint, {
	        token: this.token,
	        sig: this.sig,
	        format: "json"
	      });
	    }
	  }, {
	    key: "closeAndRetry",
	    value: function closeAndRetry() {
	      this.close();
	      this.readyState = SOCKET_STATES.connecting;
	    }
	  }, {
	    key: "ontimeout",
	    value: function ontimeout() {
	      this.onerror("timeout");
	      this.closeAndRetry();
	    }
	  }, {
	    key: "poll",
	    value: function poll() {
	      var _this9 = this;

	      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
	        return;
	      }

	      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
	        if (resp) {
	          var status = resp.status;
	          var token = resp.token;
	          var sig = resp.sig;
	          var messages = resp.messages;

	          _this9.token = token;
	          _this9.sig = sig;
	        } else {
	          var status = 0;
	        }

	        switch (status) {
	          case 200:
	            messages.forEach(function (msg) {
	              return _this9.onmessage({ data: JSON.stringify(msg) });
	            });
	            _this9.poll();
	            break;
	          case 204:
	            _this9.poll();
	            break;
	          case 410:
	            _this9.readyState = SOCKET_STATES.open;
	            _this9.onopen();
	            _this9.poll();
	            break;
	          case 0:
	          case 500:
	            _this9.onerror();
	            _this9.closeAndRetry();
	            break;
	          default:
	            throw "unhandled poll status " + status;
	        }
	      });
	    }
	  }, {
	    key: "send",
	    value: function send(body) {
	      var _this10 = this;

	      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
	        if (!resp || resp.status !== 200) {
	          _this10.onerror(status);
	          _this10.closeAndRetry();
	        }
	      });
	    }
	  }, {
	    key: "close",
	    value: function close(code, reason) {
	      this.readyState = SOCKET_STATES.closed;
	      this.onclose();
	    }
	  }]);

	  return LongPoll;
	})();

	exports.LongPoll = LongPoll;

	var Ajax = (function () {
	  function Ajax() {
	    _classCallCheck(this, Ajax);
	  }

	  _createClass(Ajax, null, [{
	    key: "request",
	    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
	      if (window.XDomainRequest) {
	        var req = new XDomainRequest(); // IE8, IE9
	        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
	      } else {
	        var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
	        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
	        this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
	      }
	    }
	  }, {
	    key: "xdomainRequest",
	    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
	      var _this11 = this;

	      req.timeout = timeout;
	      req.open(method, endPoint);
	      req.onload = function () {
	        var response = _this11.parseJSON(req.responseText);
	        callback && callback(response);
	      };
	      if (ontimeout) {
	        req.ontimeout = ontimeout;
	      }

	      // Work around bug in IE9 that requires an attached onprogress handler
	      req.onprogress = function () {};

	      req.send(body);
	    }
	  }, {
	    key: "xhrRequest",
	    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
	      var _this12 = this;

	      req.timeout = timeout;
	      req.open(method, endPoint, true);
	      req.setRequestHeader("Content-Type", accept);
	      req.onerror = function () {
	        callback && callback(null);
	      };
	      req.onreadystatechange = function () {
	        if (req.readyState === _this12.states.complete && callback) {
	          var response = _this12.parseJSON(req.responseText);
	          callback(response);
	        }
	      };
	      if (ontimeout) {
	        req.ontimeout = ontimeout;
	      }

	      req.send(body);
	    }
	  }, {
	    key: "parseJSON",
	    value: function parseJSON(resp) {
	      return resp && resp !== "" ? JSON.parse(resp) : null;
	    }
	  }, {
	    key: "serialize",
	    value: function serialize(obj, parentKey) {
	      var queryStr = [];
	      for (var key in obj) {
	        if (!obj.hasOwnProperty(key)) {
	          continue;
	        }
	        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
	        var paramVal = obj[key];
	        if (typeof paramVal === "object") {
	          queryStr.push(this.serialize(paramVal, paramKey));
	        } else {
	          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
	        }
	      }
	      return queryStr.join("&");
	    }
	  }, {
	    key: "appendParams",
	    value: function appendParams(url, params) {
	      if (Object.keys(params).length === 0) {
	        return url;
	      }

	      var prefix = url.match(/\?/) ? "&" : "?";
	      return "" + url + prefix + this.serialize(params);
	    }
	  }]);

	  return Ajax;
	})();

	exports.Ajax = Ajax;

	Ajax.states = { complete: 4 };

	// Creates a timer that accepts a `timerCalc` function to perform
	// calculated timeout retries, such as exponential backoff.
	//
	// ## Examples
	//
	//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
	//      return [1000, 5000, 10000][tries - 1] || 10000
	//    })
	//    reconnectTimer.setTimeout() // fires after 1000
	//    reconnectTimer.setTimeout() // fires after 5000
	//    reconnectTimer.reset()
	//    reconnectTimer.setTimeout() // fires after 1000
	//

	var Timer = (function () {
	  function Timer(callback, timerCalc) {
	    _classCallCheck(this, Timer);

	    this.callback = callback;
	    this.timerCalc = timerCalc;
	    this.timer = null;
	    this.tries = 0;
	  }

	  _createClass(Timer, [{
	    key: "reset",
	    value: function reset() {
	      this.tries = 0;
	      clearTimeout(this.timer);
	    }

	    // Cancels any previous setTimeout and schedules callback
	  }, {
	    key: "setTimeout",
	    value: (function (_setTimeout) {
	      function setTimeout() {
	        return _setTimeout.apply(this, arguments);
	      }

	      setTimeout.toString = function () {
	        return _setTimeout.toString();
	      };

	      return setTimeout;
	    })(function () {
	      var _this13 = this;

	      clearTimeout(this.timer);

	      this.timer = setTimeout(function () {
	        _this13.tries = _this13.tries + 1;
	        _this13.callback();
	      }, this.timerCalc(this.tries + 1));
	    })
	  }]);

	  return Timer;
	})();

/***/ }
/******/ ]);