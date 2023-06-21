import { keepDoublePlaceholder } from '@kwenta/sdk/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useDashboardCompetition } from 'hooks/useDashboardCompetition'

const Container = styled.p`
	font-family: ${(props) => props.theme.fonts.monoBold};
	font-style: normal;
	font-size: 23px;
	line-height: 25px;
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.competitionBanner.state.text};
	margin: 0;
`

export const CompetitionState = () => {
	const { t } = useTranslation()

	const { state, difference } = useDashboardCompetition()

	const secondsToMinutes = difference / 60
	const hours = keepDoublePlaceholder(Math.floor(secondsToMinutes / 60))
	const minutes = keepDoublePlaceholder(Math.ceil(secondsToMinutes % 60))

	let copying = ''

	switch (state) {
		case 'comingSoon':
			copying = `${t('common.competition.before-launch-date')}`
			break

		case 'comingToStart':
			copying = `${t('common.competition.24h-before-launch-date')} ${hours}:${minutes}`
			break

		case 'live':
			copying = `${t('common.competition.during-competition')}`
			break

		case 'comingToEnd':
			copying = `${t('common.competition.24h-before-end-date')} ${hours}:${minutes}`
			break

		case 'ended':
			copying = `${t('common.competition.24h-after-end-date')}`
			break

		default:
			copying = ''
	}

	return <Container>{copying}</Container>
}
