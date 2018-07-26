import {isObject, isString, isNumber, isBoolean, uniq as unique, flatten} from 'lodash-es';

const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');


/**
 * Generate a random integer between a start end end value.
 *
 * @param {integer} end				The start of the range.
 * @param {integer} [start=0]		The end of the range.
 * @returns {integer}				Random generated number.
 */
export function randomInt(end, start=0) {
	return Math.floor(Math.random() * end) + start;
}

/**
 * Generate a randomstring.
 *
 * @param {integer} [length=32]		The length of string to generate.
 * @returns {string}				Random generated string.
 */
export function randomString(length=32) {
	return (new Array(length)).fill(0).map(()=>chars[randomInt(chars.length - 1)]).join('');
}

/**
 * Get the length of a message object. Used to fake the content-length header in socket.io routes.
 *
 * @private
 * @param {*} message     Message to get length of.  This is assumed to be an object.
 * @returns {number}      Message length.
 */
export function getContentLength(message) {
	try {
		if (isObject(message)) return JSON.stringify(message || {}).length.toString();
		return message.toString().length.toString();
	} catch(err) {}

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
export function definePropertyFixed(instance, propertyName, value) {
	makeArray(propertyName).forEach((_propertyName, n)=>Object.defineProperty(instance, _propertyName, {
		configurable: false,
		enumerable: true,
		get: ()=>Array.isArray(propertyName)?value[n]:value,
		set: ()=>false
	}));

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
export function defineProperty(instance, propertyName, value, configurable=false) {
	makeArray(propertyName).forEach((_propertyName, n)=>Object.defineProperty(instance, _propertyName, {
		configurable,
		enumerable: true,
		writable: true,
		value:Array.isArray(propertyName)?value[n]:value
	}));

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
export function rebinder(takeFrom, bindTo, methods) {
	makeArray(methods.methods).forEach(method=>{
		bindTo[method] = takeFrom[method].bind(bindTo);
	});
	makeArray(methods.properties).forEach(property=>Object.defineProperty(bindTo, property, {
		get: ()=>takeFrom[property],
		set: value=>{takeFrom[property] = value}
	}));

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
export function makeArray(value) {
	if (value === undefined) return [];
	if (value instanceof Set) return [...value];
	return (Array.isArray(value) ? value : [value]);
}

export {isObject};
export {isString};
export {isNumber};
export {isBoolean};
export {unique};
export {flatten};