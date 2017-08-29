'use strict';

const util = require('./util');

class PrivateMembers extends WeakMap {
	constructor() {
		super();
	}

	get(parent, key) {
		if (!super.has(parent)) super.set(parent, new Map());
		return super.get(parent).get(key);
	}

	set(parent, key, value) {
		if (!super.has(parent)) super.set(parent, new Map());
		const $private = super.get(parent);
		if (util.isObject(key)) {
			Object.keys(key).forEach(_key=>$private.set(_key, key[_key]));
		} else {
			$private.set(key, value);
		}

		return this;
	}

	has(parent, key) {
		if (!super.has(parent)) super.set(parent, new Map());
		return super.get(parent).has(key);
	}

	call(parent, key, params) {
		if (!super.has(parent)) super.set(parent, new Map());
		return this.get(parent, key).call(parent, ...params);
	}
}

module.exports = PrivateMembers;