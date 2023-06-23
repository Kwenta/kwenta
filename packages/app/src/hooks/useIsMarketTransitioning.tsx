import { differenceInSeconds } from 'date-fns'
import { useEffect, useState } from 'react'

const SIX_HOURS = 6 * 60 * 60

const useIsMarketTransitioning = (nextOpen: Date | null) => {
	const [now, setNow] = useState(new Date())
	useEffect(() => {
		const timerID = setInterval(() => setNow(new Date()), 1000)
		return function cleanup() {
			clearInterval(timerID)
		}
	}, [])

	if (nextOpen == null) return false
	return differenceInSeconds(nextOpen, now) <= SIX_HOURS
}

export default useIsMarketTransitioning
