import { get as getFromStore, readonly, writable } from 'svelte/store';
import { onValue, ref } from 'firebase/database';
import { realtime } from '../../hooks.client';

const connectedRef = ref(realtime, '.info/connected');
export const _isOnline = writable(false);
export const isOnline = readonly(_isOnline);
export const getIsOnline = () => getFromStore(isOnline);
onValue(connectedRef, (sn) => _isOnline.set(sn.val() === true));
