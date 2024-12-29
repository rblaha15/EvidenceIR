interface ObjectConstructor {
	recursiveKeys(o: {}): string[];
}

interface Object {
	mapEntries<T extends Record<string, any>, U extends readonly [PropertyKey, any]>(
		this: T,
		callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
	): {
		[K in keyof T]: U;
	};

	mapValues<T extends Record<string, any>, U>(
		this: T,
		callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
	): {
		[K in keyof T]: U;
	};

	mapKeys<T extends Record<string, any>, U>(
		this: T,
		callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
	): {
		[K in keyof T]: U;
	};
}

Object.defineProperties(Object.prototype, {
	mapEntries: { writable: true },
	mapKeys: { writable: true },
	mapValues: { writable: true }
});

Object.recursiveKeys = (o: {}): string[] =>
	Object.entries(o).map(([key, value]) =>
		typeof value === 'object' && !Array.isArray(value) && value !== null
			? `${key}.${Object.recursiveKeys(value)}`
			: key
	);
Object.prototype.mapEntries = <typeof Object.mapEntries>function (callback) {
	return Object.fromEntries(
		Object.entries(this).map(([key, value], index, array) => callback(key, value, index, array))
	);
};
Object.prototype.mapValues = <typeof Object.mapValues>function (callback) {
	return Object.fromEntries(
		Object.entries(this).map(([key, value], index, array) => [
			key,
			callback(key, value, index, array)
		])
	);
};
Object.prototype.mapKeys = <typeof Object.mapKeys>function (callback) {
	return Object.fromEntries(
		Object.entries(this).map(([key, value], index, array) => [
			callback(key, value, index, array),
			value
		])
	);
};
