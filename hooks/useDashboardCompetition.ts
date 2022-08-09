import { useState, useEffect } from 'react';

import { COMPETITION_DATES } from 'constants/competition';
import { PERIOD_IN_SECONDS } from 'constants/period';
import { calculatedTimeDifference } from 'utils/formatters/date';

type TCompetitionSate = 'comingSoon' | 'comingToStart' | 'live' | 'comingToEnd' | 'ended';

/**
 * @example
 * ```
 * const START_DATE = new Date(2022, 7, 18);
 * const END_DATE = new Date(2022, 7, 22);
 *
 * const diff_0 = differenceInSeconds(START_DATE, new Date(2022, 7, 9));
 * console.log('coming soon: ', diff_0); // 777600
 *
 * const diff_1 = differenceInSeconds(START_DATE, new Date(2022, 7, 17, 1));
 * console.log('coming to start in 24h: ', diff_1); // 82800
 *
 * const diff_2_1 = differenceInSeconds(START_DATE, new Date(2022, 7, 19));
 * const diff_2_2 = differenceInSeconds(END_DATE, new Date(2022, 7, 19));
 * console.log('live: ', diff_2_1, diff_2_2); // -86400, 259200
 *
 * const diff_3 = differenceInSeconds(END_DATE, new Date(2022, 7, 21, 1));
 * console.log('will be ended in 24 hours: ', diff_3); // 0 < 82800 < 60 * 60 * 24
 *
 * const diff_4 = differenceInSeconds(END_DATE, new Date(2022, 7, 23));
 * console.log('ended: ', diff_4); // -86400
 * ```
 */
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
				if (_difference < PERIOD_IN_SECONDS.ONE_DAY) {
					setState('comingToStart');
					setDifference(_difference);
				} else {
					setState('comingSoon');
				}
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
