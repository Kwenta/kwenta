import { useState } from 'react';
import localStore from 'utils/localStore';

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		const item = localStore.get<T>(key);
		return item != null ? item : initialValue;
	});

	const setValue = (value: T) => {
		const valueToStore = value instanceof Function ? value(storedValue) : value;
		setStoredValue(valueToStore);
		localStore.set(key, valueToStore);
	};

	return [storedValue, setValue] as const;
}

export default useLocalStorage;
