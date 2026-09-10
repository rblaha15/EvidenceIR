import { derived, type Readable } from 'svelte/store';

export const flattenStores = <T>(
    outer: Readable<Readable<T>>,
): Readable<T> => derived(outer, (inner, set) => inner.subscribe(set));

export const flatDerived = <T, U>(
    store: Readable<T>,
    fn: (value: T) => Readable<U>,
): Readable<U> => derived(store, (value, set) => {
    const inner = fn(value);
    return inner.subscribe(set);
});

export function waitForFirst<T, R extends T>(store: Readable<T>, predicate: (value: T) => value is R): Promise<R>;
export function waitForFirst<T>(store: Readable<T>, predicate: (value: T) => boolean): Promise<T>;
export function waitForFirst<T>(store: Readable<T>): Promise<T>;

export function waitForFirst<T>(store: Readable<T>, predicate?: (value: T) => boolean) {
    return new Promise<T>(resolve => {
        store.subscribe(value => {
            if (!predicate || predicate(value)) resolve(value);
        });
    });
}

export function filtered<T, R extends T>(store: Readable<T>, predicate: (value: T) => value is R) {
    return derived<Readable<T>, R>(store, (value, set) => {
        if (predicate(value)) set(value);
    });
}
