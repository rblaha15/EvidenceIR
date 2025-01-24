import { browser } from '$app/environment';
import { get, writable, type Writable } from 'svelte/store';
import { page } from '$app/state';

export const relUrl = (url: string = '') => '/' + page.params.lang + url;
export const detailUrl = (url: string = '') => relUrl('/detail/' + page.params.irid + url);

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
				if (value != undefined)
					localStorage.setItem(key, JSON.stringify(value))
				else
					localStorage.removeItem(key);
			store.set(value);
		},
		update: (updater) => {
			const updated = updater(get(store));

			if (isBrowser())
				if (updated != undefined)
					localStorage.setItem(key, JSON.stringify(updated))
				else
					localStorage.removeItem(key);
			store.set(updated);
		}
	};
	return _storeable;
};
