import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { COMPETITION_DATES } from 'constants/competition';
import { PERIOD_IN_SECONDS } from 'constants/period';
import { calculatedTimeDifference, keepDoublePlaceholder } from 'utils/formatters/date';

type TCompetitionSate = 'comingSoon' | 'live' | 'comingToEnd' | 'ended';

const Container = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
	font-style: normal;
	font-weight: 700;
	font-size: 21px;
	line-height: 25px;
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.competitionBanner.state.text};
	// clear UA style.
	margin: 0;
`;

export const CompetitionState = () => {
	const { t } = useTranslation();

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

	const secondsToMinutes = difference / 60;
	const hours = keepDoublePlaceholder(Math.floor(secondsToMinutes / 60));
	const minutes = keepDoublePlaceholder(Math.floor(secondsToMinutes % 60));

	let copying = '';

	switch (state) {
		case 'comingSoon':
			copying = `${t('common.competition.before-launch-date')} ${hours}:${minutes}`;
			break;

		case 'live':
			copying = `${t('common.competition.during-competition')}`;
			break;

		case 'comingToEnd':
			copying = `${t('common.competition.24h-before-end-date')} ${hours}:${minutes}`;
			break;

		case 'ended':
			copying = `${t('common.competition.after-end-date')}`;
			break;

		default:
			copying = '';
	}

	return <Container>{copying}</Container>;
};
