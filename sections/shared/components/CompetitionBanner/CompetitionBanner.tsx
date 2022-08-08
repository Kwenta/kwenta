import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { EXTERNAL_LINKS } from 'constants/links';
import { ExternalLink } from 'styles/common';
import { breakpoints } from 'styles/media';

const BannerContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 22px 0;
	border: ${(props) => props.theme.colors.selectedTheme.competitionBanner.border};
	border-radius: 8px;
	margin-bottom: 35px;
	@media (max-width: ${breakpoints.sm}px) {
		border-radius: 0;
		margin-bottom: 0;
	}
	gap: 10px;
`;

const CompetitionPeriod = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
	font-style: normal;
	font-weight: 700;
	font-size: 8px;
	line-height: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	// clear UA style.
	margin: 0;
`;

const CompetitionState = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
	font-style: normal;
	font-weight: 700;
	font-size: 21px;
	line-height: 25px;
	color: ${(props) => props.theme.colors.selectedTheme.competitionBanner.state.text};
	// clear UA style.
	margin: 0;
`;

const CTA = styled(ExternalLink)`
	padding: 6px 11.5px;
	background: #ffb800;
	border-radius: 15px;
	border: none;
	font-family: ${(props) => props.theme.fonts.regular};
	font-style: normal;
	font-weight: 900;
	font-size: 8px;
	line-height: 8px;
	color: #080808;
	text-transform: capitalize;

	&:hover {
		cursor: pointer;
	}
`;

export const CompetitionBanner = () => {
	const { t } = useTranslation();

	return (
		<BannerContainer>
			<CompetitionPeriod>August 10-12</CompetitionPeriod>
			<CompetitionState>{t('common.competition.during-competition')}</CompetitionState>
			<CTA href={EXTERNAL_LINKS.Competition.LearnMore}>{t('common.learn-more')}</CTA>
		</BannerContainer>
	);
};
