import { useState, useEffect, useCallback } from 'react';

import localStore from 'utils/localStore';

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(localStore.get<T>(key) ?? initialValue);

	const setValue = useCallback(
		(value: T) => {
			setStoredValue(value);
			localStore.set(key, value);
		},
		[key, setStoredValue]
	);

	useEffect(() => {
		const item = localStore.get<T>(key);
		if (item) {
			setStoredValue(item);
		}
	}, [key, setStoredValue]);

	return [storedValue, setValue] as const;
}

export default useLocalStorage;
