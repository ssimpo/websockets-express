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
	return ary.reduce((a, b)=>a.concat(b), []);
}

function definePropertyFixed(instance, propertyName, value) {
	Object.defineProperty(instance, propertyName, {
		configurable: false,
		enumerable: true,
		get: ()=>value,
		set: ()=>false
	});
}

function defineProperty(instance, propertyName, value, configurable=false) {
	Object.defineProperty(instance, propertyName, {
		configurable,
		enumerable: true,
		writable: true,
		value
	});
}

function rebinder(takeFrom, bindTo, properties) {
	(properties.methods || []).forEach(method=>{
		bindTo[method] = takeFrom[method].bind(bindTo);
	});
	(properties.properties || []).forEach(property=>Object.defineProperty(bindTo, property, {
		get: ()=>takeFrom[property],
		set: value=>{takeFrom[property] = value}
	}));
}

module.exports = {
	isObject, isNumber, isBoolean, isString, unique, flatten, definePropertyFixed, defineProperty, rebinder
};