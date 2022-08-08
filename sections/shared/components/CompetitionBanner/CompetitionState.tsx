import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useDashboardCompetition } from 'hooks/useDashboardCompetition';
import { keepDoublePlaceholder } from 'utils/formatters/date';

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

	const { state, difference } = useDashboardCompetition();

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
