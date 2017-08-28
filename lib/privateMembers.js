'use strict';

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
		return getMemberMap(this, parent).set(key, value);
	}

	has(parent, key) {
		return getMemberMap(this, parent).has(key);
	}

	call(parent, key, params) {
		return this.get(parent, key).call(parent, ...params);
	}
}

module.exports = PrivateMembers;