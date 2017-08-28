'use strict';

const util = require('./util');

function getMemberMap(lookup, parent) {
	if (!lookup.has(parent)) lookup.set(parent, new Map());
	return lookup.get(parent);
}

class PrivateMembers extends WeakMap {
	constructor() {
		super();
	}

	get(parent, key) {
		return getMemberMap(this, parent).get(key);
	}

	set(parent, key, value) {
		const $private = getMemberMap(this, parent);
		if (util.isObject(key)) {
			Object.keys(key).forEach(_key=>$private.set(key, key[_key]));
		} else {
			$private.set(key, value);
		}

		return this;
	}

	has(parent, key) {
		return getMemberMap(this, parent).has(key);
	}

	call(parent, key, params) {
		return this.get(parent, key).call(parent, ...params);
	}
}

module.exports = PrivateMembers;