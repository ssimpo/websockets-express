'use strict';

function isObject(value) {
	return ((value !== null) && (typeof value === 'object') && !isString(value) && !isNumber(value));
}

function isString(value) {
	return ((typeof value === 'string') || (value instanceof String));
}

function isNumber(value) {
	return ((typeof value === 'number') || (value instanceof Number));
}

function isBoolean(value) {
	return ((typeof value === 'boolean') || (value instanceof Boolean));
}

function unique(ary) {
	return [...new Set(ary)];
}

function flatten(...ary) {
	return ary.reduce((a, b) => a.concat(b), []);
}

module.exports = {
	isObject, isNumber, isBoolean, isString, unique, flatten
};