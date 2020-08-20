import { useEffect, useRef } from 'react';
import noop from 'lodash/noop';

function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef(noop);

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current();
		}
		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}

export default useInterval;
