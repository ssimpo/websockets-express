'use strict';

/**
 * Is the given value and object? This is searching for standard object types that are not object versions of natives,
 * null or arrays.
 *
 * @param {*} value			Value to test.
 * @returns {boolean}		Is it an object?
 */
function isObject(value) {
	return ((value !== null) && (typeof value === 'object') && !isString(value) && !isNumber(value) && Array.isArray(value));
}

/**
 * Test if given value is a string.
 *
 * @param {*} value			Value to test.
 * @returns {boolean}		Is value a string?
 */
function isString(value) {
	return ((typeof value === 'string') || (value instanceof String));
}

/**
 * Test if given value is a number.
 *
 * @note This is not the same as testing if a string is a numeric value.
 *
 * @param {*} value			Value to test.
 * @returns {boolean}		Is value a number?
 */
function isNumber(value) {
	return ((typeof value === 'number') || (value instanceof Number));
}

/**
 * Test if given value is a boolean.
 *
 * @param {*} value			Value to test.
 * @returns {boolean}		Is the value a boolean?
 */
function isBoolean(value) {
	return ((typeof value === 'boolean') || (value instanceof Boolean));
}

/**
 * Return an array with duplicated items removed.  Will return a new array.
 *
 * @param {Array} ary		Array to return unique items of.
 * @returns {Array}			New array of unique items.
 */
function unique(ary) {
	return [...new Set(makeArray(ary))];
}

/**
 * Flatten an array, reducing each sub-array's items to the parent array. Will return a new array.
 *
 * @param {Array} ary		Array to flatten.
 * @returns {Array}			Flattened array.
 */
function flatten(...ary) {
	return ary.reduce((a, b)=>a.concat(b), []);
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
	makeArray(propertyName).forEach((propertyName, n)=>Object.defineProperty(instance, propertyName, {
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
function defineProperty(instance, propertyName, value, configurable=false) {
	makeArray(propertyName).forEach(propertyName=>Object.defineProperty(instance, propertyName, {
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
function rebinder(takeFrom, bindTo, methods) {
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
function makeArray(value) {
	if (value === undefined) return [];
	if (value instanceof Set) return [...value];
	return (Array.isArray(value)?value:[value]);
}

module.exports = {
	isObject, isNumber, isBoolean, isString, unique, flatten, definePropertyFixed, defineProperty, rebinder, makeArray
};