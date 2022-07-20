import debounce from 'lodash/debounce';
import { useState, useEffect, DependencyList, useCallback } from 'react';

// source: https://github.com/SevenOutman/use-debounced-memo

export function useDebouncedMemo<T>(
	factory: () => T,
	deps: DependencyList | undefined,
	debounceMs: number
): T {
	const [state, setState] = useState(factory());

	// eslint-disable-next-line
	const debouncedSetState = useCallback(debounce(setState, debounceMs), []);

	useEffect(() => {
		debouncedSetState(factory());
		// eslint-disable-next-line
	}, deps);

	return state;
}

export default useDebouncedMemo;
