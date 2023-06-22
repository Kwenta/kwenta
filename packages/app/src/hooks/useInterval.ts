import noop from 'lodash/noop'
import { useEffect, useRef } from 'react'

function useInterval(callback: () => void, delay: number | null, deps: Array<any> = []) {
	const savedCallback = useRef(noop)

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current()
		}
		if (delay !== null) {
			const id = setInterval(tick, delay)
			return () => clearInterval(id)
		}
		// eslint-disable-next-line
	}, [delay, ...deps])
}

export default useInterval
