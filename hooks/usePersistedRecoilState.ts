import { RecoilState, useRecoilState } from 'recoil';
import localStore from 'utils/localStore';

export function usePersistedRecoilState<T>(recoilState: RecoilState<T>) {
	const [storedValue, setStoredValue] = useRecoilState(recoilState);

	const setValue = (value: T) => {
		const valueToStore = value instanceof Function ? value(storedValue) : value;
		setStoredValue(valueToStore);
		localStore.set(recoilState.key, valueToStore);
	};

	return [storedValue, setValue] as const;
}

export default usePersistedRecoilState;
