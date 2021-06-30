import { useState, useEffect } from 'react';
import localStore from 'utils/localStore';

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(localStore.get<T>(key) ?? initialValue);

	const setValue = (value: T) => {
		const valueToStore = value instanceof Function ? value(storedValue) : value;
		setStoredValue(valueToStore);
		localStore.set(key, valueToStore);
	};

	useEffect(() => {
		const item = localStore.get<T>(key);
		if (item) {
			setStoredValue(item);
		}
	}, [key, setStoredValue]);

	return [storedValue, setValue] as const;
}

export default useLocalStorage;
