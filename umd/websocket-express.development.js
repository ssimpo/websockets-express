(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null) return null;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */

  var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;
  /** Used as a reference to the global object. */

  var root = freeGlobal || freeSelf || Function('return this')();

  /** Built-in value references. */

  var _Symbol = root.Symbol;

  /** Used for built-in method references. */

  var objectProto = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty = objectProto.hasOwnProperty;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString = objectProto.toString;
  /** Built-in value references. */

  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */

  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
    } catch (e) {}

    var result = nativeObjectToString.call(value);

    {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }

    return result;
  }

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString$1 = objectProto$1.toString;
  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */

  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  /** `Object#toString` result references. */

  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';
  /** Built-in value references. */

  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */

  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }

    return symToStringTag$1 && symToStringTag$1 in Object(value) ? getRawTag(value) : objectToString(value);
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && _typeof(value) == 'object';
  }

  /** `Object#toString` result references. */

  var argsTag = '[object Arguments]';
  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */

  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  /** Used for built-in method references. */

  var objectProto$2 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
  /** Built-in value references. */

  var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */

  var isArguments = baseIsArguments(function () {
    return arguments;
  }()) ? baseIsArguments : function (value) {
    return isObjectLike(value) && hasOwnProperty$1.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  };

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */

  /** Built-in value references. */

  var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = _typeof(value);

    return value != null && (type == 'object' || type == 'function');
  }

  /** `Object#toString` result references. */

  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';
  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */

  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    } // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.


    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /** Used to detect overreaching core-js shims. */

  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */

  var maskSrcKey = function () {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
  }();
  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */


  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }

  /** Used for built-in method references. */
  var funcProto = Function.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString = funcProto.toString;
  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */

  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}

      try {
        return func + '';
      } catch (e) {}
    }

    return '';
  }

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */

  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  /** Used to detect host constructors (Safari). */

  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  /** Used for built-in method references. */

  var funcProto$1 = Function.prototype,
      objectProto$3 = Object.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString$1 = funcProto$1.toString;
  /** Used to check objects for own properties. */

  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
  /** Used to detect if a method is native. */

  var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */

  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }

    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */

  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /* Built-in method references that are verified to be native. */

  var nativeCreate = getNative(Object, 'create');

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */

  /* Built-in method references that are verified to be native. */

  var Map$1 = getNative(root, 'Map');

  /** Used to stand-in for `undefined` hash values. */

  /**
   * Checks if `value` is in the array cache.
   *
   * @private
   * @name has
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {number} Returns `true` if `value` is found, else `false`.
   */

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} predicate The function invoked per iteration.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  /**
   * The base implementation of `_.isNaN` without support for number objects.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   */

  /**
   * A specialized version of `_.indexOf` which performs strict equality
   * comparisons of values, i.e. `===`.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */

  /**
   * This function is like `arrayIncludes` except that it accepts a comparator.
   *
   * @private
   * @param {Array} [array] The array to inspect.
   * @param {*} target The value to search for.
   * @param {Function} comparator The comparator invoked per element.
   * @returns {boolean} Returns `true` if `target` is found, else `false`.
   */

  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */

  /* Built-in method references that are verified to be native. */

  var Set$1 = getNative(root, 'Set');

  /**
   * This method returns `undefined`.
   *
   * @static
   * @memberOf _
   * @since 2.3.0
   * @category Util
   * @example
   *
   * _.times(2, _.noop);
   * // => [undefined, undefined]
   */
  function noop() {// No operation performed.
  }

  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);
    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }

  /** Used as references for various `Number` constants. */

  var INFINITY = 1 / 0;
  /**
   * Creates a set object of `values`.
   *
   * @private
   * @param {Array} values The values to add to the set.
   * @returns {Object} Returns the new set.
   */

  var createSet = !(Set$1 && 1 / setToArray(new Set$1([, -0]))[1] == INFINITY) ? noop : function (values) {
    return new Set$1(values);
  };

  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
  /**
   * Generate a random integer between a start end end value.
   *
   * @param {integer} end				The start of the range.
   * @param {integer} [start=0]		The end of the range.
   * @returns {integer}				Random generated number.
   */

  function randomInt(end) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return Math.floor(Math.random() * end) + start;
  }
  /**
   * Generate a randomstring.
   *
   * @param {integer} [length=32]		The length of string to generate.
   * @returns {string}				Random generated string.
   */

  function randomString() {
    var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
    return new Array(length).fill(0).map(function () {
      return chars[randomInt(chars.length - 1)];
    }).join('');
  }

  var buffer = window.buffer;
  var ready = false;
  var bson;
  var afterReady = new Set();
  var defaultSocketId = 'main';
  var endpoints = new Map();
  var callbacks = new Map();
  var acknowledgements = new Map();
  var sendQueue = new Map();
  var sockets = new Map();
  var serializers = new Map();
  var deserializers = new Map();
  var status = new Map();
  var SOCKETSTATUS = Object.freeze({
    CONNECTING: 1,
    RECONNECTING: 2,
    CLOSED: 3,
    CONNECTED: 4
  });

  var HTTP_ERROR =
  /*#__PURE__*/
  function (_Error) {
    _inherits(HTTP_ERROR, _Error);

    function HTTP_ERROR(message) {
      var _getPrototypeOf2;

      var _this;

      _classCallCheck(this, HTTP_ERROR);

      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(HTTP_ERROR)).call.apply(_getPrototypeOf2, [this, message.message].concat(params)));
      _this.status = message.status;
      return _this;
    }

    return HTTP_ERROR;
  }(_wrapNativeSuper(Error));
  /**
   * Initiate this module, binding into all the correct global and framework points.
   */


  function init() {
    var _window = window,
        _window$jQuery = _window.jQuery,
        jQuery = _window$jQuery === void 0 ? !!window.$ && !!window.$.jQuery ? window.$ : undefined : _window$jQuery,
        angular = _window.angular,
        bolt = _window.bolt,
        doc = _window.document;
    if (!!jQuery) window.jQuery.websocket = new WebSocketService();
    if (!!angular) angular.module("websocket-express", []).factory("$websocket", function () {
      return new WebSocketService();
    });

    if (!!bolt) {
      bolt.WebSocketService = WebSocketService;

      if (!!bolt.MODE && (bolt.MODE.has("DEVELOPMENT") || bolt.MODE.has("DEBUG"))) {
        bolt.WebSocketService.DEBUG = true;
      }
    }

    if (!!bolt && !!jQuery && !!angular) window.WebSocketService = WebSocketService; // This is extracted from jQuery.ready(), we want the works in all situations provided by jQuery without
    // the jQuery dependency. (@see https://github.com/jquery/jquery/blob/master/src/core/ready.js).

    function completed() {
      document.removeEventListener("DOMContentLoaded", completed);
      window.removeEventListener("load", completed);
      onReady();
    }

    if (doc.readyState === "complete" || doc.readyState !== "loading" && !doc.documentElement.doScroll) {
      window.setTimeout(onReady);
    } else {
      document.addEventListener("DOMContentLoaded", completed);
      window.addEventListener("load", completed);
    }
  }
  /**
   * Function to call when document is ready.  Only run once to perform all waiting websocket messages.
   */


  function onReady() {
    setEndpoints();

    if (!!window.BSON && !!WebSocketServiceInstance) {
      WebSocketServiceInstance.addSerializer("bson", defaultBsonSerializer).addDeserializer("bson", defaultBsonDeserializer);
    }

    ready = true;
    afterReady.forEach(function (callback) {
      return callback();
    });
    afterReady.clear();
  }
  /**
   * Check if a status property is not one of a number of enum values.
   *
   * @param {*} status			Status to check.
   * @param {Object} enumeral		Enum to check within.
   * @param {Arrray} checks		Enum values to check.
   * @returns {boolean}			Does it pass the test.
   */


  function notEnum(status, enumeral, checks) {
    var _status = true;
    checks.forEach(function (check) {
      _status = _status && status !== enumeral[check];
    });
    return _status;
  }
  /**
   * Search through all the locations for websocket endpoint definitions setting these.  Will use defaults if non
   * found. These can be defined in <link rel="websocket-endpoint"> tags, where the title attribute is the endpoint
   * name and the href is the endpoint.
   */


  function setEndpoints() {
    setDefaultEndPoint();
    var endpointLinkElements = window.document.querySelectorAll("link[rel=websocket-endpoint][href]");

    if (endpointLinkElements.length) {
      for (var n = 0; n < endpointLinkElements.length; n++) {
        var url = (endpointLinkElements[n].getAttribute("href") || "").trim();

        if (url !== "") {
          var title = (endpointLinkElements[n].getAttribute("title") || "").trim();
          if (title === "") title = defaultSocketId;
          endpoints.set(title, url);
        }
      }
    }
  }
  /**
   * Set the endpoint of the default endpoint, searching all the definition points for this.
   */


  function setDefaultEndPoint() {
    var _ref = [window.location.origin, window.document.querySelector("base[href]")],
        origin = _ref[0],
        baseElement = _ref[1];
    var url;

    if (baseElement) {
      var base = (baseElement.getAttribute("href") || "").trim().replace(origin, "");
      if (base !== "") url = "".concat(origin).concat(base);
    } else {
      url = "".concat(origin, "/");
    }

    url = url.replace("https://", "wss://").replace("http://", "ws://");
    endpoints.set(defaultSocketId, url);
  }
  /**
   * Create an acknowledge handler.
   *
   * @param {Function} resolve		Promise resolve handler.
   * @param {Function} reject			Promise rejection handler.
   * @returns {Function}				The handler.
   */


  function createAcknowledge(resolve, reject) {
    return function (err, response) {
      if (err) return reject(err);

      if ((response.status || 200) >= 400) {
        if (err) return reject(err);
        var message = (response.body || response.statusMessage || "").trim();

        var _status2 = response.status || 400;

        return reject(new HTTP_ERROR({
          message: message,
          status: _status2
        }));
      }

      return resolve(response);
    };
  }
  /**
   * Is given websocket ready for transporting data?
   *
   * @param {string} [socketId=defaultSocketId]		The socket id to test.
   * @returns {boolean}								Is it ready?
   */


  function socketReady() {
    var socketId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSocketId;
    if (!sockets.has(socketId)) return undefined;
    var ws = sockets.get(socketId);
    return ws.readyState === ws.OPEN ? ws : undefined;
  }
  /**
   * Send all the messages for a given socket that are in the queue.
   *
   * @param {string} [socketId=defaultSocketId]		The socket id to send messages for.
   */


  function runSendQueue() {
    var socketId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSocketId;

    var _sendQueue = sendQueue.get(socketId);

    var ws = socketReady(socketId);

    if (_sendQueue && ws) {
      _sendQueue.forEach(function (messageFunction) {
        return ws.send(messageFunction());
      });

      _sendQueue.clear();

      sendQueue.delete(socketId);
    }
  }
  /**
   * Send a given message on a given socket.
   *
   * @param {Function} messageFunction				Message function to call to generate the message.
   * @param {string} [socketId=defaultSocketId]		The socket to send on.
   */


  function send(messageFunction) {
    var socketId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSocketId;
    var ws = socketReady(socketId);
    if (ws) return ws.send(messageFunction());
    if (!sendQueue.has(socketId)) sendQueue.set(socketId, new Set());
    sendQueue.get(socketId).add(messageFunction);
  }
  /**
   * Get callbacksfor given listen type on given socket.
   * @param {string} type								The type to get for.
   * @param {string} [socketId=defaultSocketId]		The socket to get callbacks for.
   * @returns {Array.<Function>}						Array of callbacks.
   */


  function getCallbacks(type) {
    var socketId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSocketId;
    if (!callbacks.has(socketId)) callbacks.set(socketId, new Map());
    if (!callbacks.get(socketId).has(type)) callbacks.get(socketId).set(type, new Set());
    return callbacks.get(socketId).get(type);
  }
  /**
   * Remove the given callback from a callback set.
   *
   * @param {Set.<Set>} callbacks		Callback to search through.
   * @param {Function} callback		Callback to remove.
   */


  function removeCallback(callbacks, callback) {
    callbacks.forEach(function (callbacks) {
      return callbacks.delete(callback);
    });
  }
  /**
   * Get the endpoint url for the given socket id.
   *
   * @param {string} [url]			The url to set endpoint to.
   * @param {string} socketId			The socket id to set endpoint on.
   * @returns {string}				The endpoint url for given socket id.
   */


  function setEnpointUrl(url, socketId) {
    if (url) {
      if (!ready) {
        afterReady.add(function () {
          return endpoints.set(socketId, url);
        });
      } else {
        endpoints.set(socketId, url);
      }
    }

    if (!url && !endpoints.has(socketId)) throw new URIError("No websocket endpoint for ".concat(socketId));
    if (!url && endpoints.has(socketId)) url = endpoints.get(socketId);
    return url;
  }
  /**
   * Try reconnecting to given socket after it has dropped.
   *
   * @param {string} url			The endpoint url for websocket.
   * @param {string} socketId		The socket id.
   */


  function reconnect(url, socketId) {
    sockets.delete(socketId);
    setTimeout(function () {
      if (notEnum(status.get(socketId), SOCKETSTATUS, ['CONNECTING', 'RECONNECTING', 'CONNECTED'])) {
        status.set(socketId, SOCKETSTATUS.RECONNECTING);
        if (!!WebSocketService.DEBUG) console.log("Trying reconnect");
        sockets.set(socketId, new WebSocket(url));
        connecting(sockets.get(socketId), url, socketId);
      }
    }, 1000 * 3);
  }

  function _drop(socketId) {
    sockets.get(socketId).close();
  }
  /**
   * Handle websocket connection, errors and reconnection.
   *
   * @param {WebSocket} ws			The websocket to handle.
   * @param {string} url				The endpoint to connect to.
   * @param {string} socketId			The socket id to set.
   */


  function connecting(ws, url, socketId) {
    /**
     * After open listener, setup message handling and send the message queue.
     */
    function open() {
      status.set(socketId, SOCKETSTATUS.CONNECTED);
      if (!!WebSocketService.DEBUG) console.log("Opened ".concat(url, " for ").concat(socketId));
      ws.addEventListener("close", close);
      ws.addEventListener("message", message);
      runSendQueue(socketId);
    }
    /**
     * Close listener, try to reconnect.
     */


    function close() {
      status.set(socketId, SOCKETSTATUS.CLOSED);
      if (!!WebSocketService.DEBUG) console.log("Closed ".concat(url, " for ").concat(socketId));
      ws.removeEventListener("open", open);
      ws.removeEventListener("close", message);
      ws.removeEventListener("message", message);
      reconnect(url, socketId, ws);
    }
    /**
     * Handle any websocket errors.
     *
     * @param {Error} err		Error message to handle.
     */


    function error(err) {
      console.error("Error on ".concat(url, " for ").concat(socketId), err);
      return close();
    }
    /**
     * Handle a message event
     *
     * @param {Event} messageEvent		The message event to handle.
     */


    function message(messageEvent) {
      var respond = function respond(message) {
        if (!message.id) {
          if (callbacks.has(message.type)) {
            callbacks.get(type).forEach(function (callbacks) {
              return callback(message.data);
            });
          }
        } else {
          if (acknowledgements.has(message.id)) {
            var acknowledgement = acknowledgements.get(message.id);

            if (message.type === 'error') {
              acknowledgement(message.data, null);
            } else {
              acknowledgement(null, message.data);
            }

            acknowledgements.delete(message.id);
          }
        }
      };

      if (typeof messageEvent.data === 'string') {
        respond(deserializers.get('json')(messageEvent.data));
      } else if (messageEvent.data instanceof Blob) {
        var reader = new FileReader();

        reader.onload = function () {
          respond(new buffer.Buffer(new Uint8Array(this.result)));
        };

        reader.readAsArrayBuffer(messageEvent.data);
      }
    }

    ws.addEventListener("error", error);
    ws.addEventListener("open", open);
  }
  /**
   * Connect to a given endpoint for socket id supplied.
   *
   * @param {string} [url]	The endpoint to connect to.
   * @param socketId			The socket id to connecct for.
   */


  function _connect(url, socketId) {
    url = setEnpointUrl(url, socketId);

    if (notEnum(status.get(socketId), SOCKETSTATUS, ['CONNECTING', 'RECONNECTING', 'CONNECTED'])) {
      status.set(socketId, SOCKETSTATUS.CONNECTING);
      if (!sockets.has(socketId)) sockets.set(socketId, new WebSocket(url));
      connecting(sockets.get(socketId), url, socketId);
    }
  }
  /**
   * Bson serializer.
   *
   * @param {*} data		Data to parse into BSON.
   * @returns {Buffer}	BSON from the data.
   */


  function defaultBsonSerializer(data) {
    try {
      return bson.serialize(data);
    } catch (err) {
      throw new TypeError("Could not convert data to bson for sending");
    }
  }
  /**
   * Json serializer (default one applied by default to all new socket channels).
   *
   * @param {*} data		Data to parse into JSON.
   * @returns {string}	JSON from the data.
   */


  function defaultJsonSerializer(data) {
    try {
      return JSON.stringify(data);
    } catch (err) {
      throw new TypeError("Could not convert data to json for sending");
    }
  }
  /**
   * Json deserializer (default one applied by default to all new socket channels).
   *
   * @param {string} data			Data to parse from JSON.
   * @returns {Object|Array|*}	Parsed data.
   */


  function defaultJsonDeserializer(data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      throw new TypeError("Could not convert from json string.");
    }
  }
  /**
   * Bson deserializer.
   *
   * @param {string} data			Data to parse from BSON..
   * @returns {Object|Array|*}	Parsed data.
   */


  function defaultBsonDeserializer(data) {
    try {
      return bson.deserialize(data);
    } catch (err) {
      throw new TypeError("Could not convert from json string.");
    }
  }

  var WebSocketServiceInstance;
  /**
   * Websocket handler service
   *
   * @singleton
   */

  var WebSocketService =
  /*#__PURE__*/
  function () {
    function WebSocketService() {
      _classCallCheck(this, WebSocketService);

      if (!WebSocketServiceInstance) WebSocketServiceInstance = this;
      this.addSerializer("json", defaultJsonSerializer).addDeserializer("json", defaultJsonDeserializer);
      return WebSocketServiceInstance;
    }
    /**
     * Connect to a given endpoint for given socket-id.
     *
     * @param {string} url								Endpoint to connect to.
     * @param {string} [socketId=defaultSocketId]		Socket id to connect for.
     */


    _createClass(WebSocketService, [{
      key: "connect",
      value: function connect(url) {
        var socketId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSocketId;
        if (!url && !ready) return afterReady.add(function () {
          return _connect(url, socketId);
        });

        _connect(url, socketId);
      }
    }, {
      key: "drop",
      value: function drop() {
        var socketId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSocketId;

        _drop(socketId);
      }
      /**
       * Add a listener for given message type on given socket.
       *
       * @param {Function} callback		Listener callback.
       * @param {string} type				Message type to listen for.
       * @param {string} socketId			Socket id to use.
       * @returns {Function}				Unlisten function.
       */

    }, {
      key: "listen",
      value: function listen(callback, type) {
        var socketId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultSocketId;
        getCallbacks(type, socketId).add(callback);
        return function () {
          return getCallbacks(type, socketId).delete(callback);
        };
      }
      /**
       * Remove a given listener on the given socket.
       *
       * @param {Function} callback		Listener to remove.
       * @param {string} socketId			Socket id to remove listener on.
       */

    }, {
      key: "removeListener",
      value: function removeListener(callback, socketId) {
        if (socketId && callbacks.has(socketId)) return removeCallback(callbacks.get(socketId), callback);
        callbacks.forEach(function (callbacks) {
          return removeCallback(callbacks, callback);
        });
      }
      /**
       * Send a request on the given socket.
       *
       * @param {Object} data							Data to send.
       * @param {string} [socketId=defaultSocketId]	Socket to send on.
       * @param {string} [type=json]					Type of data to send.
       * @returns {Promise.<Object>}					Promise resolving to server response.
       */

    }, {
      key: "request",
      value: function request(data) {
        var socketId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSocketId;
        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'json';
        data.method = data.method || "get";
        return new Promise(function (resolve, reject) {
          var id = randomString();
          acknowledgements.set(id, createAcknowledge(resolve, reject));
          var message = {
            type: "request",
            id: id,
            data: data
          };
          send(function () {
            if (serializers.has(type)) return serializers.get(type)(message);
            throw new TypeError("No parser for type ".concat(type));
          }, socketId);
        });
      }
    }, {
      key: "requestJson",
      value: function requestJson(data) {
        var socketId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSocketId;
        return this.request(data, socketId, 'json');
      }
    }, {
      key: "requestBson",
      value: function requestBson(data) {
        var socketId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSocketId;
        return this.request(data, socketId, 'bson');
      }
      /**
       * Is given socket open and ready?
       *
       * @param {string} [socketId=defaultSocketId]		Socket to test for readiness.
       * @returns {boolean}								Is it ready?
       */

    }, {
      key: "ready",
      value: function ready() {
        var socketId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSocketId;
        return !!socketReady(socketId);
      }
      /**
       * Add an endpoint url for a given id.
       *
       * @param {string} id				The id set endpoint on.
       * @param {string} url				The endpoint url.
       * @param {WebSocketService}		For chaining.
       */

    }, {
      key: "addEndpoint",
      value: function addEndpoint(id, url) {
        endpoints.set(id, url);
        return this;
      }
      /**
       * remove an endpoint for a given id.
       *
       * @param {string} id				The id to remove an endpoint for.
       * @param {WebSocketService}		For chaining.
       */

    }, {
      key: "removeEndpoint",
      value: function removeEndpoint(id) {
        endpoints.delete(id);
        return this;
      }
      /**
       * Add a message serializer for given type.
       *
       * @param {string} type				Message type to add for.
       * @param {Function} serializer		Serializer function to add.
       * @returns {WebSocketService}		For chaining.
       */

    }, {
      key: "addSerializer",
      value: function addSerializer(type, serializer) {
        serializers.set(type, serializer);
        return this;
      }
      /**
       * Remove a serializer for a given message type.
       *
       * @param {string} type				Message type to remove for.
       * @returns {WebSocketService}		For chaining.
       */

    }, {
      key: "removeSerializer",
      value: function removeSerializer(type) {
        serializers.delete(type);
        return this;
      }
      /**
       * Add a message deserializer for given type.
       *
       * @param {string} type					Message type to add for.
       * @param {Function} deserializer		Deserializer function to add.
       * @returns {WebSocketService}			For chaining.
       */

    }, {
      key: "addDeserializer",
      value: function addDeserializer(type, deserializer) {
        deserializers.set(type, deserializer);
        return this;
      }
      /**
       * Remove a deserializer for a given message type.
       *
       * @param {string} type				Message type to remove for.
       * @returns {WebSocketService}		For chaining.
       */

    }, {
      key: "removeDeserializer",
      value: function removeDeserializer(type) {
        deserializers.delete(type);
        return this;
      }
      /**
       * Get the default socket id.
       *
       * @returns {string}
       */

    }, {
      key: "defaultSocketId",
      get: function get() {
        return defaultSocketId;
      }
      /**
       * Get the object type string.
       *
       * @returns {string}
       */

    }, {
      key: Symbol.toStringTag,
      get: function get() {
        return "WebSocketService";
      }
    }]);

    return WebSocketService;
  }();

  WebSocketService.DEBUG = false;
  init();

})));

//# sourceMappingURL=websocket-express.development.js.map
