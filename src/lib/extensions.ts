/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection JSUnusedGlobalSymbols

import "core-js/proposals/array-grouping-v2"

declare global {
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

        entries<T extends Record<string, unknown>>(
            this: T,
        ): [keyof T, T[keyof T]][];

        keys<T extends string>(
            this: { [_ in T]?: unknown },
        ): T[];

        getValues<T extends Record<PropertyKey, unknown>>(
            this: T,
        ): T[keyof T][];

        zip<T extends Record<PropertyKey, unknown>, U extends Record<PropertyKey, unknown>>(
            this: T,
            other: U
        ): {
            [K in keyof T | keyof U]: [T[K], U[K]]
        };

        omit<T extends Record<PropertyKey, unknown>, K extends keyof T>(
            this: T,
            ...keys: K[]
        ): Omit<T, K>;

        pick<T extends Record<PropertyKey, unknown>, K extends keyof T>(
            this: T,
            ...keys: K[]
        ): Pick<T, K>;

        let<T, U>(
            this: T,
            callback: (self: T) => U
        ): U;

        also<T, U>(
            this: T,
            callback: (self: T) => U
        ): U extends PromiseLike<infer _> ? Promise<T> : T;

        thenAlso<T extends PromiseLike<unknown>, U>(
            this: T,
            callback: (self: Awaited<T>) => U
        ): T;
    }
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
    omit: { writable: true },
    pick: { writable: true },
    let: { writable: true },
    also: { writable: true },
    thenAlso: { writable: true },
});

Object.prototype.entries = function() {
    return Object.entries(this);
} as typeof Object.prototype.entries;
Object.prototype.getValues = function() {
    return Object.values(this);
} as typeof Object.prototype.getValues;
Object.prototype.keys = function() {
    return Object.keys(this);
} as typeof Object.prototype.keys;
Object.prototype.mapTo = function <T extends Record<PropertyKey, unknown>, U>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
) {
    return this.entries().map(([key, value], index, array) =>
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    );
};
Object.prototype.forEachEntry = function <T extends Record<PropertyKey, unknown>>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => unknown
) {
    this.entries().forEach(([key, value], index, array) =>
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    );
};
Object.prototype.mapEntries = function <T extends Record<PropertyKey, unknown>, U extends [PropertyKey, unknown]>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U | undefined
) {
    return [...this.entries()].mapNotUndefined(([key, value], index, array) =>
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    ).toRecord<U[0], U[1]>();
};
Object.prototype.mapValues = function <T extends Record<PropertyKey, unknown>, U>(
    this: T,
    callback: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => U
) {
    return this.entries().map(([key, value], index, array) => [
        key,
        callback(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    ] as [keyof T, U]).toRecord();
};
Object.prototype.filterValues = function <T extends Record<PropertyKey, unknown>>(
    this: T,
    predicate: (key: keyof T, value: T[keyof T], index: number, array: [keyof T, T[keyof T]][]) => boolean
) {
    return this.entries().filter(([key, value], index, array) =>
        predicate(key, value as T[keyof T], index, array as [keyof T, T[keyof T]][])
    ).toRecord() as { [K in keyof T]: T[K] | never; };
};

Object.prototype.zip = function(other) {
    const keys = [...this.keys(), ...other.keys()];
    return keys.map(key => [key, [this[key], other[key]]] as [PropertyKey, unknown[]]).toRecord();
} as typeof Object.prototype.zip;

Object.prototype.omit = function <T extends Record<PropertyKey, unknown>, K extends keyof T>(
    this: T,
    ...keys: K[]
): Omit<T, K> {
    return this.filterValues(key => !(keys as (keyof T)[]).includes(key));
};

Object.prototype.pick = function <T extends Record<PropertyKey, unknown>, K extends keyof T>(
    this: T,
    ...keys: K[]
): Pick<T, K> {
    return this.filterValues(key => (keys as (keyof T)[]).includes(key));
};

Object.recursiveKeys = (o: Record<string, unknown>): string[] =>
    o.entries().map(([key, value]) =>
        typeof value === 'object' && !Array.isArray(value) && value !== null
            ? Object.recursiveKeys(value as Record<string, unknown>).map(it => `${key}.${it}`)
            : [key]
    ).flat();

Object.prototype.let = function <T, U>(
    this: T,
    callback: (self: T) => U
): U {
    return callback(this);
};
Object.prototype.also = function <T, U>(
    this: T,
    callback: (self: T) => U
): (U extends PromiseLike<infer _> ? Promise<T> : T) {
    const result = callback(this);
    if (typeof result == 'object' && result != null && 'then' in result && result.then instanceof Function)
        return new Promise<T>(resolve => {
            (result.then as (fn: () => void) => void)(() => resolve(this));
        }) as U extends PromiseLike<infer _> ? Promise<T> : T;
    else
        return this as U extends PromiseLike<infer _> ? Promise<T> : T;
};

Object.prototype.thenAlso = function <T extends PromiseLike<any>, U>(
    this: T,
    callback: (self: Awaited<T>) => U
): T {
    this.then(callback);
    return this;
};

declare global {
    interface Number {
        roundTo: (this: number, decimalPlaces?: number) => number;
    }
}

Number.prototype.roundTo = function(decimalPlaces = 0) {
    const power = 10 ** decimalPlaces;
    return Math.round(this * power) / power;
};


declare global {
    interface Array<T> {
        zip<T, U>(
            this: T[] | readonly T[],
            other: U[] | readonly U[]
        ): [T, U][];

        mapNotUndefined<T, U>(
            this: T[],
            callback: (value: T, index: number, array: T[]) => U | undefined
        ): U[];

        filterNotUndefined<T>(
            this: (T | undefined)[],
        ): T[];

        toRecord<K extends PropertyKey, V>(
            this: (readonly [K, V])[] | readonly (readonly [K, V])[],
        ): {
            [Key in K]: V
        };

        associate<T, K extends PropertyKey, V>(
            this: T[] | readonly T[],
            transform: (value: T, index: number, array: T[]) => readonly [K, V],
        ): {
            [Key in K]: V
        };

        associateBy<K extends PropertyKey, V>(
            this: V[] | readonly V[],
            keySelector: (value: V, index: number, array: V[]) => K
        ): {
            [Key in K]: V
        };

        associateWith<K extends PropertyKey, V>(
            this: K[] | readonly K[],
            valueSelector: (key: K, index: number, array: K[]) => V
        ): {
            [Key in K]: V
        };

        associateWithSelf<T extends PropertyKey>(
            this: T[] | readonly T[],
        ): {
            [Key in T]: T
        };

        distinctBy<T, K>(
            this: T[] | readonly T[],
            key: (item: T, index: number, array: T[]) => K,
            options?: { reversed?: boolean },
        ): T[];

        distinct<T>(
            this: T[] | readonly T[],
            options?: { reversed?: boolean },
        ): T[];

        awaitAll<T>(
            this: Iterable<T | PromiseLike<T>>,
        ): Promise<Awaited<T>[]>;

        window<T>(
            this: T[],
            size: number,
            step?: number,
            partialWindows?: boolean
        ): T[][];

        chunk<T>(
            this: T[],
            size: number
        ): T[][];

        with<T extends unknown[]>(
            this: T,
            index: number,
            value: T[keyof T]
        ): T;

        toggle<T>(
            this: T[],
            value: T
        ): T[];

        sumBy<T>(
            this: T[] | readonly T[],
            callback: (value: T, index: number, array: T[]) => number,
        ): number;

        groupBy<K extends PropertyKey, T>(
            this: T[],
            keySelector: (item: T, index: number) => K,
        ): Record<K, T[]>

        last<T>(
            this: T[] | readonly T[],
        ): T;
    }

    interface ReadonlyArray<T> {
        zip<T, U>(
            this: T[] | readonly T[],
            other: U[] | readonly U[]
        ): [T, U][];

        toRecord<K extends PropertyKey, V>(
            this: [K, V][] | readonly [K, V][],
        ): {
            [Key in K]: V
        };

        associate<T, K extends PropertyKey, V>(
            this: T[] | readonly T[],
            transform: (value: T, index: number, array: T[]) => readonly [K, V],
        ): {
            [Key in K]: V
        };

        associateBy<K extends PropertyKey, V>(
            this: V[] | readonly V[],
            keySelector: (value: V, index: number, array: V[]) => K
        ): {
            [Key in K]: V
        };

        associateWith<K extends PropertyKey, V>(
            this: K[] | readonly K[],
            valueSelector: (key: K, index: number, array: K[]) => V
        ): {
            [Key in K]: V
        };

        associateWithSelf<T extends PropertyKey>(
            this: T[] | readonly T[],
        ): {
            [Key in T]: T
        };


        distinctBy<T, K>(
            this: T[] | readonly T[],
            key: (item: T, index: number, array: T[]) => K,
            options?: { reversed?: boolean }
        ): T[];

        sumBy<T>(
            this: T[] | readonly T[],
            callback: (value: T, index: number, array: T[]) => number,
        ): number;

        toggle<T>(
            this: T[] | readonly T[],
            value: T
        ): T[];
    }
}

Array.prototype.zip = function(other) {
    return this.map((item, index) => [item, other[index]]);
} as typeof Array.prototype.zip;

Array.prototype.mapNotUndefined = function(callback) {
    return this.map(callback).filterNotUndefined();
} as typeof Array.prototype.mapNotUndefined;

Array.prototype.filterNotUndefined = function() {
    return this.filter(it => it != undefined);
} as typeof Array.prototype.filterNotUndefined;

Array.prototype.toRecord = function() {
    return Object.fromEntries(this);
} as typeof Array.prototype.toRecord;

Array.prototype.associate = function<T, K extends PropertyKey, V>(
    this: T[],
    transform: (value: T, index: number, array: T[]) => readonly [K, V],
): {
    [Key in K]: V
} {
    return this.map(transform).toRecord();
};

Array.prototype.associateBy = function<K extends PropertyKey, V>(
    this: V[],
    keySelector: (value: V, index: number, array: V[]) => K
) {
    return this.associate((v, i, a) => [keySelector(v, i, a), v]);
};

Array.prototype.associateWith = function<K extends PropertyKey, V>(
    this: K[],
    valueSelector: (key: K, index: number, array: K[]) => V
) {
    return this.associate((k, i, a) => [k, valueSelector(k, i, a)]);
};

Array.prototype.associateWithSelf = function<T extends PropertyKey>(
    this: T[],
) {
    return this.associate(v => [v, v] as const);
};

Array.prototype.awaitAll = function() {
    return Promise.all(this);
} as typeof Array.prototype.awaitAll;

Array.prototype.groupBy = function(ks) {
    return { ...Object.groupBy(this, ks) };
} as typeof Array.prototype.groupBy;

Array.prototype.distinctBy = function <T, K>(
    this: T[],
    key: (value: T, index: number, array: T[]) => K,
    { reversed = false }: { reversed?: boolean } = {}
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

Array.prototype.distinct = function <T>(
    this: T[],
    { reversed = false }: { reversed?: boolean } = {}
) {
    return this.distinctBy(it => it, { reversed }) as T[];
}

Array.prototype.window = function <T>(
    this: T[],
    size: number,
    step: number = 1,
    partialWindows: boolean = false
): T[][] {
    if (size <= 0 || step <= 0) throw new RangeError('Size and step bust be positive');

    const thisSize = this.length;
    const resultCapacity = Math.floor(thisSize / step) + (thisSize % step == 0 ? 0 : 1);
    const result = Array<T[]>(resultCapacity);
    let index = 0;
    let arrayIndex = 0;
    while (0 <= index && index < thisSize) {
        const windowSize = Math.min(size, thisSize - index);
        if (windowSize < size && !partialWindows) break;
        result[arrayIndex++] = Array.from(Array(windowSize), (_, i) => this[i + index]);
        index += step;
    }
    return result;
};

Array.prototype.chunk = function <T>(
    this: T[],
    size: number
): T[][] {
    return this.window(size, size, true);
};

Array.prototype.with = function <T extends unknown[]>(
    this: T,
    index: number,
    value: T[keyof T]
): T {
    const copy = [...this];
    copy[index] = value;
    return copy as T;
};

Array.prototype.toggle = function <T>(
    this: T[],
    value: T
): T[] {
    return this.includes(value) ? this.toSpliced(this.indexOf(value), 1) : [...this, value];
};

Array.prototype.sumBy = function(callback) {
    return [...this].reduce((sum, v, i, a) => sum + callback(v, i, a), 0);
} as typeof Array.prototype.sumBy;

Array.prototype.last = function() {
    return this.at(-1);
} as typeof Array.prototype.last;

declare global {
    interface String {
        toNumber: () => number;
    }
}

String.prototype.toNumber = function(this: string) {
    return Number(this);
};

// TLM

export function range(startInclusive: number, endExclusive: number): number[];
export function range(endExclusive: number): number[];
export function range(p0: number, p1?: number): number[] {
    const start = p1 == undefined ? 0 : p0;
    const end = p1 == undefined ? p0 : p1;
    return newArray(end - start, i => start + i);
}

export const arrayOf = <T>(size: number, value: T) => newArray(size, () => value);
export const newArray = <T>(size: number, filler: (index: number) => T) =>
    Array.from(Array(size), (_, i) => filler(i));

export const newString = (count: number, filler: (index: number) => string) => newArray(count, filler).join('');
export const stringOf = (count: number, value: string) => arrayOf(count, value).join('');