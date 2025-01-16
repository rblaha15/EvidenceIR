import { type Readable, writable } from 'svelte/store';

export const setTitle = (title: string) => t.set(title);
const t = writable('SEIR');
export const titleSvelte = t as Readable<string>;