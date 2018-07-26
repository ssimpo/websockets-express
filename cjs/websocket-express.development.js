'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var http = _interopDefault(require('http'));
var ws = _interopDefault(require('ws'));
var typeis = _interopDefault(require('type-is'));
var EventEmitter = _interopDefault(require('events'));
var mime = _interopDefault(require('mime'));
var _vary = _interopDefault(require('vary'));
var depd = _interopDefault(require('depd'));
var contentDisposition = _interopDefault(require('content-disposition'));
var statuses = _interopDefault(require('statuses'));
var crypto = _interopDefault(require('crypto'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function handleUpgrade(app) {
  var wss = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new ws.Server({
    noServer: true
  });
  // https://github.com/websockets/ws/blob/master/lib/WebSocketServer.js#L77
  return function (req, socket, upgradeHead) {
    var res = new http.ServerResponse(req);
    res.assignSocket(socket); // avoid hanging onto upgradeHead as this will keep the entire
    // slab buffer used by node alive

    var head = new Buffer(upgradeHead.length);
    upgradeHead.copy(head);
    res.on('finish', function () {
      return res.socket.destroy();
    });

    res.websocket = function (cb) {
      return wss.handleUpgrade(req, socket, head, function (client) {
        wss.emit('connection', client);
        if (cb) cb(client, app);
      });
    };

    return app(req, res);
  };
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

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
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

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
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

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
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? getRawTag(value)
    : objectToString(value);
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
  return value != null && typeof value == 'object';
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
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$1.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
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
var isArray = Array.isArray;

/** Built-in value references. */
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

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
  var type = typeof value;
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
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
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
      return (func + '');
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
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

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
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

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
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$4.call(data, key);
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

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
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root, 'Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$1 || ListCache),
    'string': new Hash
  };
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

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
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

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
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

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
function noop() {
  // No operation performed.
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

  set.forEach(function(value) {
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
var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set$1(values);
};

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length) ? baseUniq(array) : [];
}

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

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
/**
 * Get the length of a message object. Used to fake the content-length header in socket.io routes.
 *
 * @private
 * @param {*} message     Message to get length of.  This is assumed to be an object.
 * @returns {number}      Message length.
 */

function getContentLength(message) {
  try {
    if (isObject(message)) return JSON.stringify(message || {}).length.toString();
    return message.toString().length.toString();
  } catch (err) {}

  return "1";
}
/**
 * Define a defineProperty object for non-configurable property.
 *
 * @param {Object} instance							Instance to do defineProperty on.
 * @param {string|Array.<string>} propertyName		Property name(s) to do defineProperty on.
 * @param {*} value									The property value to set.
 * @returns {Object}								The the instance for chaining purposes.
 */

function definePropertyFixed(instance, propertyName, value) {
  makeArray(propertyName).forEach(function (_propertyName, n) {
    return Object.defineProperty(instance, _propertyName, {
      configurable: false,
      enumerable: true,
      get: function get() {
        return Array.isArray(propertyName) ? value[n] : value;
      },
      set: function set() {
        return false;
      }
    });
  });
  return instance;
}
/**
 * Define a defineProperty object for a standard enumerable, read/write property.
 *
 * @param {Object} instance							Instance to do defineProperty on.
 * @param {string|Array.<string>} propertyName		Property name(s) to do defineProperty on.
 * @param {*} value									The property value to set.
 * @param {boolean} [configurable=false]			Is this going to set the configurable property?
 * @returns {Object}								The the instance for chaining purposes.
 */

function defineProperty(instance, propertyName, value) {
  var configurable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  makeArray(propertyName).forEach(function (_propertyName, n) {
    return Object.defineProperty(instance, _propertyName, {
      configurable: configurable,
      enumerable: true,
      writable: true,
      value: Array.isArray(propertyName) ? value[n] : value
    });
  });
  return instance;
}
/**
 * Bind a given set of methods in one object to another object.
 *
 * @param {Object} takeFrom			Object to bind methods in.
 * @param {Object} bindTo			Object to bind each method to.
 * @param {Array} methods			Methods to bind.
 * @returns {Object}				The takeFrom object for chaining.
 */

function rebinder(takeFrom, bindTo, methods) {
  makeArray(methods.methods).forEach(function (method) {
    bindTo[method] = takeFrom[method].bind(bindTo);
  });
  makeArray(methods.properties).forEach(function (property) {
    return Object.defineProperty(bindTo, property, {
      get: function get() {
        return takeFrom[property];
      },
      set: function set(value) {
        takeFrom[property] = value;
      }
    });
  });
  return takeFrom;
}
/**
 * Turn the given value into an array.  If it is already an array then return it; if it is a set then convert to an
 * array; and if neither then return as the first item in an array. The purpose of this function is for function
 * or method parameters where they can be either a array or not.  You can use this to ensure you are working on
 * an array.
 *
 * @public
 * @param {Array|Set|*} value		Value to return or convert.
 * @returns {Array}					The converted value (or original if already an array).
 */

function makeArray(value) {
  if (value === undefined) return [];
  if (value instanceof Set) return _toConsumableArray(value);
  return Array.isArray(value) ? value : [value];
}

var ignoreHeaders = ['upgrade', 'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-extensions'];
var addHeaders = {
  Connection: 'keep-alive'
};
/**
 * Should a given request header be excluded in the new generated request? Used to remove upgrade style headers from
 * the generated request.
 *
 * @param {string} header		Header name to test.
 * @returns {boolean}			Should it be excluded.
 */

function excludeHeader(header) {
  return Object.keys(addHeaders).includes(header.toString()) || ignoreHeaders.includes(header.toString().toLowerCase());
}
/**
 * Given a request object and a message object, return a rawHeaders property for the request.
 *
 * @param {WebsocketRequest} req		The request to get rawHeaders on.
 * @param {Object} message				The associated websocket message.
 * @returns {Array.<string>}			The rawHeaders array.
 */


function rawHeadersFactory(req, message) {
  var filterNext = false;
  return flatten.apply(void 0, _toConsumableArray(Object.keys(addHeaders).map(function (headerName) {
    return [headerName, addHeaders[headerName]];
  }))).concat(req.rawHeaders.map(function (header) {
    if (!filterNext && !excludeHeader(header)) return header;
    filterNext = !filterNext;
  }).filter(function (header) {
    return header;
  })).concat(flatten.apply(void 0, _toConsumableArray(Object.keys(message.headers).map(function (headerName) {
    return [headerName, message.headers[headerName]];
  }))).map(function (header) {
    if (!filterNext && !excludeHeader(header)) return header;
    filterNext = !filterNext;
  }).filter(function (header) {
    return header;
  }));
}
/**
 * Factory for generating headers for WebsocketRequest.
 *
 * @param {WebsocketRequest} req		The request to generate headers on.
 * @param {Object} message				The associated websocket message.
 * @returns {Proxy}						Headers object.
 */

function requestHeadersFactory(req, message) {
  var headers = {};
  Object.keys(req.headers).forEach(function (_header) {
    var header = _header.toLocaleLowerCase();

    if (!ignoreHeaders.includes(header)) headers[header] = req.headers[_header];
  });
  Object.keys(message.headers || {}).forEach(function (key) {
    headers[key.toLocaleLowerCase()] = message.headers[key];
  });
  Object.keys(addHeaders).forEach(function (key) {
    headers[key.toLocaleLowerCase()] = addHeaders[key];
  });
  return new Proxy(headers, {
    get: function get(target, property, receiver) {
      return Reflect.get(target, property, receiver) || (!ignoreHeaders.includes(property) ? Reflect.get(req.headers, property, receiver) : undefined);
    },
    set: function set(target, property, value, receiver) {
      return Reflect.set(target, property, value, receiver);
    },
    has: function has(target, property) {
      return Reflect.has(target, property) || (!ignoreHeaders.includes(property) ? Reflect.has(req.headers, property) : undefined);
    },
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, property) {
      if (Reflect.has(target, property)) return Reflect.getOwnPropertyDescriptor(target, property);

      if (!ignoreHeaders.includes(property) && Reflect.has(req.headers, property)) {
        return Reflect.getOwnPropertyDescriptor(req.headers, property);
      }
    },
    ownKeys: function ownKeys(target) {
      var reqHeaders = Reflect.ownKeys(req.headers).filter(function (header) {
        return !ignoreHeaders.includes(header);
      });
      return uniq(Reflect.ownKeys(target).concat(reqHeaders));
    }
  });
}

var originalRequests = new WeakMap();
var originalMessages = new WeakMap();
var rebind = {
  methods: ['accepts', 'acceptsCharsets', 'acceptsEncodings', 'acceptsLanguages', 'param'],
  properties: ['hostname', 'ip', 'ips', 'subdomains', 'cookies', 'signedCookies', 'sessionID', 'session']
};
/**
 * Get the request body from a message object.
 *
 * @param {Object} message			Message object to get from.
 * @returns {Object}				The message body object.
 */

function getBody(message) {
  return isObject(message.body) ? Object.assign({}, message.body) : message.body || {};
}
/**
 * Object to mixin to the Request object.
 *
 * @type {Object}
 */


var WebsocketRequestAbstract = {
  /**
   * Get a header value.
   *
   * @param {string} header		The header to get.
   * @returns {*}					The header value.
   */
  get: function get(header) {
    return this.headers[header];
  },

  /**
   * Is the message of a given mime-type?
   *
   * @param {string|Array.<string>}		Mimetype(s) to match.
   * @returns {boolean}					Does the request match one of the given mimetypes?
   */
  is: function is() {
    for (var _len = arguments.length, types = new Array(_len), _key = 0; _key < _len; _key++) {
      types[_key] = arguments[_key];
    }

    return typeis(this, types);
  }
};
var WebsocketRequest =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(WebsocketRequest, _EventEmitter);

  function WebsocketRequest(req, message, messageId, wsId) {
    var _this;

    _classCallCheck(this, WebsocketRequest);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WebsocketRequest).call(this));
    defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), 'body', getBody(message), true);
    defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), ['method', 'originalUrl', 'params', 'path', 'query', 'url'], [message.method, message.path, {}, message.path, {}, message.path]);
    definePropertyFixed(_assertThisInitialized(_assertThisInitialized(_this)), ['app', 'headers', 'messageId', 'protocol', 'rawHeaders', 'secure', 'websocket', 'xhr', '_req', 'websocketId'], [req.app, requestHeadersFactory(req, message), messageId, req.secure ? 'wss' : 'ws', rawHeadersFactory(req, message), req.secure, true, false, req, wsId]);
    rebinder(WebsocketRequestAbstract, _assertThisInitialized(_assertThisInitialized(_this)), {
      methods: Object.keys(WebsocketRequestAbstract)
    });
    rebinder(req, _assertThisInitialized(_assertThisInitialized(_this)), rebind);
    originalRequests.set(_assertThisInitialized(_assertThisInitialized(_this)), req);
    originalMessages.set(_assertThisInitialized(_assertThisInitialized(_this)), message);
    return _this;
  }

  return WebsocketRequest;
}(EventEmitter);

var deprecate = depd('express');
var clients = new WeakMap();
var messageIdIds = new WeakMap();
var messageRecieveType = new WeakMap();
/**
 * Create a new message as a response from given WebsocketResponse and body object.
 *
 * @param {WebsocketResponse} res		Response instance.
 * @param {Object|*} body				Body object.
 * @returns {Object}					New response message.
 */

function createResponseMessage(res, body) {
  return {
    id: messageIdIds.get(res),
    type: 'response',
    data: {
      path: res.req.originalUrl,
      body: body,
      headers: res.headers || {},
      status: res.statusCode,
      statusMessage: res.statusMessage || '',
      type: res.get('Content-Type') || 'application/json'
    }
  };
}
/**
 * Send a message, using the given response instance and message.
 *
 * @param {WebsocketResponse} res		The request object.
 * @param {Object} message				The message object.
 * @param {WebsocketResponse}			For chaining.
 */


function sendMessage(res, message) {
  var type = messageRecieveType.get(res);
  var client = clients.get(res);
  if (client) client.send(JSON.stringify(message));
  res.headersSent = true;
  return res;
}
/**
 * Mixin for WebsocketResponse instances.
 *
 * @type {Object}
 */


var WebsocketResponseAbstract = {
  /**
   * Append additional header `field` with value `val`.
   *
   * Example:
   *
   *    res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   *    res.append('Warning', '199 Miscellaneous warning');
   *
   * @public
   * @param {String} field			Field to set.
   * @param {String|Array} val		Value to set.
   * @return {WebsocketResponse} 		For chaining.
   */
  append: function append(field, val) {
    var prev = this.get(field);
    var value = val;
    if (prev) value = Array.isArray(prev) ? prev.concat(val) : Array.isArray(val) ? [prev].concat(val) : [prev, val];
    return this.set(field, value);
  },

  /**
   * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
   *
   * @public
   * @param {String} filename			Filename to set it to.
   * @return {WebsocketResponse}		For chaining.
   */
  attachment: function attachment(filename) {
    if (filename) this.type(extname(filename));
    this.set('Content-Disposition', contentDisposition(filename));
    return this;
  },
  cookie: function cookie(name, value, options) {},
  clearCookie: function clearCookie(name, options) {},
  download: function download(path, filename, fn) {},
  end: function end(data, encoding) {},
  format: function format(object) {},

  /**
   * Get a specific header value.
   *
   * @param {string} field		The header to het.
   * @returns {*}					The header value.
   */
  get: function get(field) {
    return this.headers[field];
  },

  /**
   * Get a specific header value.
   *
   * @param {string} field		The header to het.
   * @returns {*}					The header value.
   */
  getHeader: function getHeader(field) {
    return this.get(field);
  },

  /**
   * Get all the header names.
   *
   * @returns {Array.<string>}		Array of header names.
   */
  getHeaderNames: function getHeaderNames() {
    return Object.keys(this.headers).sort();
  },

  /**
   * Get all the headers.
   *
   * @returns {Object}		The headers object.
   */
  getHeaders: function getHeaders() {
    return this.headers;
  },

  /**
   * Test if response has a particular header.
   *
   * @param {string} header		Header to test.
   * @returns {boolean}			Does it have given header?
   */
  hasHeader: function hasHeader(header) {
    return header in this.headers;
  },

  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'tj' });
   *
   * @public
   * @param {string|number|boolean|object} body		Body to send.
   * @return {WebsocketResponse} 						For chaining.
   */
  json: function json(body) {
    this.type('application/json');
    return this.send(body);
  },

  /**
   * Send JSON response with JSONP callback support.
   *
   * Examples:
   *
   *     res.jsonp(null);
   *     res.jsonp({ user: 'tj' });
   *
   * @public
   * @param {string|number|boolean|object} body		Body to send.
   * @return {WebsocketResponse} 						For chaining
   */
  jsonp: function jsonp(body) {
    this.type('application/javascript');
    var response = createResponseMessage(this, body);
    response.data.callback = this.app.get('jsonp callback name') || 'callback';
    return this.send(body);
  },
  links: function links(_links) {},

  /**
   * Set the location header to `url`.
   *
   * The given `url` can also be "back", which redirects to the _Referrer_ or _Referer_ headers or "/".
   *
   * Examples:
   *
   *    res.location('/foo/bar').;
   *    res.location('http://example.com');
   *    res.location('../login');
   *
   * @public
   * @param {String} url				Url to set location to.
   * @return {WebsocketResponse} 		For chaining
   */
  location: function location(path) {
    this.set('location', path);
  },

  /**
   * Redirect to the given `url` with optional response `status` defaulting to 302.
   *
   * The resulting `url` is determined by `res.location()`, so it will play nicely with mounted apps, relative paths,
   * `"back"` etc.
   *
   * Examples:
   *
   *    res.redirect('/foo/bar');
   *    res.redirect('http://example.com');
   *    res.redirect(301, 'http://example.com');
   *    res.redirect('../login'); // /blog/post/1 -> /blog/login
   *
   * @public
   * @param {number} [status=302]		Status to send.
   * @param {string} path				Path to redirect to.
   * @return {WebsocketResponse} 		For chaining.
   */
  redirect: function redirect(status, path) {
    if (!path) {
      status = 302;
      path = status;
    }

    this.status(status);
    this.type('plain/text');
    this.send(path);
  },
  render: function render(view, locals, callback) {},

  /**
   * Send a response.
   *
   * Examples:
   *
   *     res.send(Buffer.from('wahoo'));
   *     res.send({ some: 'json' });
   *     res.send('<p>some html</p>');
   *
   * @public
   * @param {string|number|boolean|object|Buffer} body		Message body to send.
   * @return {WebsocketResponse} 								For chaining.
   */
  send: function send(body) {
    return sendMessage(this, createResponseMessage(this, body));
  },
  sendFile: function sendFile(path, options, fn) {},

  /**
   * Send given HTTP status code and message.
   *
   * Sets the response status to `statusCode` and the body of the response to the standard description from node's
   * http.STATUS_CODES or the statusCode number if no description.
   *
   * Examples:
   *
   *     res.sendStatus(200);
   *
   * @public
   * @param {number} statusCode														Code to send.
   * @param {string} [statusMessage=statuses[statusCode] || this.statusMessage]		Message to send.
   * @return {WebsocketResponse} 														For chaining.
   */
  sendStatus: function sendStatus(statusCode) {
    var statusMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : statuses[statusCode] || this.statusMessage;
    this.status(statusCode);
    this.type('plain/text');
    this.send(statusMessage);
  },

  /**
   * Set header `field` to `val`, or parse an object of header fields.
   *
   * Examples:
   *
   *    res.set('Foo', ['bar', 'baz']);
   *    res.set('Accept', 'application/json');
   *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @public
   * @param {String|Object} field		Header to set
   * @param {String|Array} val		Value to set header to.
   * @return {WebsocketResponse} 		For chaining.
   */
  set: function set(field, value) {
    var headers = this.headers;

    if (isObject(field)) {
      Object.keys(field).forEach(function (header) {
        headers[header] = field[header];
      });
    } else {
      headers[field] = value;
    }
  },

  /**
   * Set header `field` to `val`, or parse an object of header fields.
   *
   * Examples:
   *
   *    res.set('Foo', ['bar', 'baz']);
   *    res.set('Accept', 'application/json');
   *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @public
   * @param {String|Object} field		Header to set
   * @param {String|Array} val		Value to set header to.
   * @return {WebsocketResponse} 		For chaining.
   */
  setHeader: function setHeader(header, value) {
    return this.set(header, value);
  },

  /**
   * Set status `code`.
   *
   * @public
   * @param {Number} code				Status code.
   * @return {WebsocketResponse}		For chaining.
   */
  status: function status(code) {
    this.statusCode = code;
    this.statusMessage = statuses[code];
    return this;
  },

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()` when it does not contain "/", or set the
   * Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   *
   * @public
   * @param {String} type				Mimetype string.
   * @return {WebsocketResponse}		For chaining.
   */
  type: function type(_type) {
    return this.set('Content-Type', _type.indexOf('/') === -1 ? mime.lookup(_type) : _type);
  },

  /**
   * Add `field` to Vary. If already present in the Vary set, then this call is simply ignored.
   *
   * @public
   * @param {Array|String} field		Field to vary.
   * @return {WebsocketResponse}		For chaining.
   */
  vary: function vary(field) {
    if (!field || Array.isArray(field) && !field.length) {
      deprecate('res.vary(): Provide a field name');
      return this;
    }

    _vary(this, field);

    return this;
  }
};
var WebsocketResponse = function WebsocketResponse(req, client, messageId, type) {
  _classCallCheck(this, WebsocketResponse);

  defineProperty(this, ['headers', 'headersSent', 'statusCode', 'statusMessage'], [{}, false, 200, 'Ok']);
  definePropertyFixed(this, ['locals', 'req', 'app', 'websocketClient'], [{}, req, req.app, client]);
  rebinder(WebsocketResponseAbstract, this, {
    methods: Object.keys(WebsocketResponseAbstract)
  });
  clients.set(this, client);
  messageIdIds.set(this, messageId);
  messageRecieveType.set(this, type);
};

function isWebsocket(req) {
  return !(!!req.websocket || !req.headers || req.headers.upgrade === undefined || req.headers.upgrade.toLowerCase() !== 'websocket');
}

function parseMessage(rawData) {
  if (isString(rawData)) {
    try {
      return ['json', JSON.parse(rawData)];
    } catch (err) {}
  }

  return ['unknown', undefined];
}

function generateMessageId(message, req) {
  var shasum = crypto.createHash('sha1');
  shasum.update("".concat(message.id).concat(req.sessionID));
  return shasum.digest('hex');
}

function handleRequest(_ref) {
  var message = _ref.message,
      app = _ref.app,
      req = _ref.req,
      client = _ref.client,
      messageId = _ref.messageId,
      type = _ref.type;
  message.data.headers = Object.assign(message.data.headers || {}, {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'identity',
    'Content-Length': getContentLength(message.data.body)
  });

  var _req = new WebsocketRequest(req, message.data, messageId, client.id);

  var _res = new WebsocketResponse(_req, client, message.id, type);

  app.handle(_req, _res);
}

function websocketMiddleware(req, res, next) {
  if (!isWebsocket(req)) return next();
  res.websocket(function (client, app) {
    client.id = randomString();

    app.getWebsocketClient = function (id) {
      return makeArray((app.wss || {}).clients).find(function (client) {
        return client.id === id;
      });
    };

    client.on('message', function (rawData) {
      var _parseMessage = parseMessage(rawData),
          _parseMessage2 = _slicedToArray(_parseMessage, 2),
          type = _parseMessage2[0],
          message = _parseMessage2[1];

      if (!!message && !!message.type) {
        var messageId = generateMessageId(message, req);
        if (message.type === 'request') return handleRequest({
          message: message,
          app: app,
          req: req,
          client: client,
          messageId: messageId,
          type: type
        });
      }
    });
  });
}
function upgrade(server, app) {
  var wss = new ws.Server({
    noServer: true
  });
  server.on('upgrade', handleUpgrade(app, wss));
  return wss;
}

exports.websocketMiddleware = websocketMiddleware;
exports.upgrade = upgrade;

//# sourceMappingURL=websocket-express.development.js.map
