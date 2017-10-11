'use strict';

/**
 * Create a proxy for WebsocketResponse locals property.
 *
 * @param {ExpressApplication} app		App instance.
 * @returns {Proxy}						The locals proxy.
 */
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
		},

		getOwnPropertyDescriptor(target, property) {
			if (Reflect.has(target, property)) return Reflect.getOwnPropertyDescriptor(target, property);
			if (Reflect.has(app, property)) return Reflect.getOwnPropertyDescriptor(app, property);
		},

		ownKeys(target) {
			return util.unique(Reflect.ownKeys(target).concat(Reflect.ownKeys(app)));
		}
	});
}

module.exports = localFactory;