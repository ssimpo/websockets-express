'use strict';

function localFactory(app) {
	return new Proxy({}, {
		get: (target, property, receiver)=>{
			return Reflect.get(target, property, receiver) || Reflect.get(app, property, receiver);
		},

		set: (target, property, value, receiver)=>{
			return Reflect.set(target, propertyKey, value, receiver);
		},

		has: (target, property)=>{
			return Reflect.has(target, property) || Reflect.has(app, property);
		}
	});
}

module.exports = localFactory;