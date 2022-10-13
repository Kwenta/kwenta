import { AtomEffect } from 'recoil';

export const localStorageEffect = <T>(key: string): AtomEffect<T> => ({ setSelf, onSet }) => {
	if (typeof window !== 'undefined') {
		const savedValue = localStorage.getItem(key);
		if (savedValue != null) {
			setSelf(JSON.parse(savedValue));
		}

		onSet((newValue: any, _: any, isReset: any) => {
			isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
		});
	}
};
