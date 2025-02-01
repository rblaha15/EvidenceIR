/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection JSUnusedGlobalSymbols

interface ObjectConstructor {
    recursiveKeys(o: Record<string, unknown>): string[];
}

interface Object {
    mapEntries<T extends Record<PropertyKey, unknown>, U extends [PropertyKey, unknown]>(
        this: T,
        callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U | undefined
    ): {
        [K in U[0]]: U[1];
    };

    mapTo<T extends Record<PropertyKey, unknown>, U>(
        this: T,
        callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
    ): U[];


    forEachEntry<T extends Record<PropertyKey, unknown>>(
        this: T,
        callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => unknown
    ): void;

    mapValues<T extends Record<PropertyKey, unknown>, U>(
        this: T,
        callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
    ): {
        [K in keyof T]: U;
    };

    filterValues<T extends Record<PropertyKey, unknown>>(
        this: T,
        predicate: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => boolean
    ): {
        [K in keyof T]: T[K] | never;
    };

    entries<T extends Record<PropertyKey, unknown>>(
        this: T,
    ): [keyof T, T[keyof T]][];

    keys<T extends PropertyKey>(
        this: Record<T, unknown>,
    ): T[];

    getValues<T>(
        this: Record<PropertyKey, T>,
    ): T[];

    zip<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(
        this: T,
        other: U,
    ): {
        [K in keyof T | keyof U]: [T[K], U[K]]
    };
}

Object.defineProperties(Object.prototype, {
    mapEntries: { writable: true },
    mapValues: { writable: true },
    filterValues: { writable: true },
    mapTo: { writable: true },
    forEachEntry: { writable: true },
    entries: { writable: true },
    getValues: { writable: true },
    keys: { writable: true },
    zip: { writable: true },
});

Object.prototype.entries = <typeof Object.prototype.entries> function() {
    return Object.entries(this);
};
Object.prototype.getValues = <typeof Object.prototype.getValues> function() {
    return Object.values(this);
};
Object.prototype.keys = <typeof Object.prototype.keys> function() {
    return Object.keys(this);
};
Object.prototype.mapTo = function<T extends Record<PropertyKey, unknown>, U>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
) {
    return this.entries().map(([key, value], index, array) =>
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    );
};
Object.prototype.forEachEntry = function<T extends Record<PropertyKey, unknown>>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => unknown
) {
    this.entries().forEach(([key, value], index, array) =>
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    );
};
Object.prototype.mapEntries = function<T extends Record<PropertyKey, unknown>, U extends [PropertyKey, unknown]>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U | undefined
) {
    return this.entries().mapNotUndefined(([key, value], index, array) =>
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    ).toRecord<U[0], U[1]>();
};
Object.prototype.mapValues = function<T extends Record<PropertyKey, unknown>, U>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
) {
    return this.entries().map(([key, value], index, array) => [
        key,
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    ] as [keyof T, U]).toRecord()
};
Object.prototype.filterValues = function<T extends Record<PropertyKey, unknown>>(
    this: T,
    predicate: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => boolean
) {
    return this.entries().filter(([key, value], index, array) =>
        predicate(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    ).toRecord() as { [K in keyof T]: T[K] | never; };
};

Object.prototype.zip = <typeof Object.prototype.zip> function(other) {
    const keys = [...this.keys(), ...other.keys()];
    return keys.map(key => [key, [this[key], other[key]]] as [PropertyKey, unknown[]]).toRecord();
};

Object.recursiveKeys = (o: Record<string, unknown>): string[] =>
    o.entries().map(([key, value]) =>
        typeof value === 'object' && !Array.isArray(value) && value !== null
            ? Object.recursiveKeys(value as Record<string, unknown>).map(it => `${key}.${it}`)
            : [key]
    ).flat();

interface Number {
    roundTo: (decimalPlaces?: number) => number;
}

Number.prototype.roundTo = function(decimalPlaces = 0) {
    const power = 10 ** decimalPlaces;
    return Math.round(this as number * power) / power;
};

interface Array<T> {
    zip<T, U>(
        this: T[] | readonly T[],
        other: U[] | readonly U[],
    ): [T, U][];

    mapNotUndefined<T, U>(
        this: T[],
        callback: (value: T, index: number, array: T[]) => U | undefined
    ): U[];

    filterNotUndefined<T>(
        this: (T | undefined)[],
    ): T[];

    toRecord<K extends PropertyKey, V>(
        this: [K, V][] | readonly [K, V][],
    ): {
        [Key in K]: V
    };

    distinctBy<T, K>(
        this: T[] | readonly T[],
        key: (item: T, index: number, array: T[]) => K,
        options?: { reversed?: boolean },
    ): T[];

    awaitAll<T>(
        this: Iterable<T | PromiseLike<T>>,
    ): Promise<Awaited<T>[]>
}

interface ReadonlyArray<T> {
    zip<T, U>(
        this: T[] | readonly T[],
        other: U[] | readonly U[],
    ): [T, U][];

    toRecord<K extends PropertyKey, V>(
        this: [K, V][] | readonly [K, V][],
    ): {
        [Key in K]: V
    };

    distinctBy<T, K>(
        this: T[] | readonly T[],
        key: (item: T, index: number, array: T[]) => K,
        options?: { reversed?: boolean },
    ): T[];
}

Array.prototype.zip = <typeof Array.prototype.zip> function(other) {
    return this.map((item, index) => [item, other[index]]);
};

Array.prototype.mapNotUndefined = <typeof Array.prototype.mapNotUndefined> function(callback) {
    return this.map(callback).filterNotUndefined();
};

Array.prototype.filterNotUndefined = <typeof Array.prototype.filterNotUndefined> function() {
    return this.filter(it => it != undefined);
};

Array.prototype.toRecord = <typeof Array.prototype.toRecord> function() {
    return Object.fromEntries(this);
};

Array.prototype.awaitAll = <typeof Array.prototype.awaitAll> function() {
    return Promise.all(this);
};

Array.prototype.distinctBy = function <T, K>(
    this: T[],
    key: (value: T, index: number, array: T[]) => K,
    { reversed = false }: { reversed?: boolean } = {},
) {
    const maybeReverse = <T>(array: T[]) => reversed ? array.toReversed() : array;

    return maybeReverse([
        ...new Map(
            maybeReverse(this.map((value, index, array) =>
                [
                    key(value, index, array),
                    value
                ] as [K | string, T]
            ))
        ).values()
    ]);
};