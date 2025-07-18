import { readonly, writable } from 'svelte/store';

const t = writable('SEIR');
const bb = writable(false);
export const setTitle = (title: string, backButton: boolean = false) => {
    t.set(title);
    bb.set(backButton);
}
export const title = readonly(t);
export const backButton = readonly(bb);

export const startLoading = () => p.set('load');
export const endLoading = () => {
    p.set('done');
    setTimeout(() => p.set(''), 700);
};
export const withLoading = <A extends unknown[], R>(
    fn: (...args: A) => Promise<R>
): (...args: A) => Promise<R> => (...args) => {
    startLoading();
    const promise = fn(...args);
    promise.finally(endLoading);
    return promise;
}
export const runLoading = <R>(
    fn: () => Promise<R>
): Promise<R> => {
    startLoading();
    const promise = fn();
    promise.finally(endLoading);
    return promise;
}
const p = writable<'' | 'done' | 'load'>('');
export const progress = readonly(p)