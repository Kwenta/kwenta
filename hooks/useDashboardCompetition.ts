import { useState, useEffect } from 'react';

import { COMPETITION_DATES } from 'constants/competition';
import { PERIOD_IN_SECONDS } from 'constants/period';
import { calculatedTimeDifference } from 'utils/formatters/date';

type TCompetitionSate = 'comingSoon' | 'live' | 'comingToEnd' | 'ended';

export const useDashboardCompetition = () => {
	const [state, setState] = useState<TCompetitionSate>('comingSoon');
	const [difference, setDifference] = useState<number>(0);

	useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date();
			const start = new Date(COMPETITION_DATES.START_DATE);
			const end = new Date(COMPETITION_DATES.END_DATE);

			let _difference = calculatedTimeDifference(start, now);
			if (_difference > 0) {
				setState('comingSoon');
				setDifference(_difference);
			} else {
				_difference = calculatedTimeDifference(end, now);
				if (_difference > 0) {
					if (_difference < PERIOD_IN_SECONDS.ONE_DAY) {
						setState('comingToEnd');
						setDifference(_difference);
					} else {
						setState('live');
					}
				} else {
					setState('ended');
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return { state, difference };
};
