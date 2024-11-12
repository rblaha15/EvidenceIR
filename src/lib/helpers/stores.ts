import { browser } from '$app/environment';
import { page } from '$app/stores';
import { derived, get, writable, type Writable } from 'svelte/store';

export const relUrl = derived(page, (page) => (url: string) => '/' + page.params.lang + url);

type GetStorable = {
	<T>(key: string): Writable<T | undefined>;
	<T>(key: string, defaultValue: T): Writable<T>;
};

export const storable: GetStorable = <T>(key: string, defaultValue?: T) => {
	const store = writable<T | undefined>(defaultValue);
	const isBrowser = () => browser;

	key = `storable_${key}`;

	if (isBrowser()) {
		const currentValue = localStorage.getItem(key);
		if (currentValue != null && currentValue != 'undefined' && currentValue != 'null')
			store.set(JSON.parse(currentValue));
		else if (defaultValue != undefined) localStorage.setItem(key, JSON.stringify(defaultValue));
	}

	const _storeable: Writable<T | undefined> = {
		subscribe: store.subscribe,
		set: (value) => {
			if (isBrowser())
				value != undefined
					? localStorage.setItem(key, JSON.stringify(value))
					: localStorage.removeItem(key);
			store.set(value);
		},
		update: (updater) => {
			const updated = updater(get(store));

			if (isBrowser())
				updated != undefined
					? localStorage.setItem(key, JSON.stringify(updated))
					: localStorage.removeItem(key);
			store.set(updated);
		}
	};
	return _storeable;
};
