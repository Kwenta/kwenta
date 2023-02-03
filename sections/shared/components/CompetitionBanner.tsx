import { memo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CompetitionBannerBg from 'assets/svg/app/competition-banner-bg.svg';
import * as Text from 'components/Text';
import { COMPETITION_DATES, COMPETITION_ENABLED } from 'constants/competition';
import { EXTERNAL_LINKS } from 'constants/links';
import { ExternalLink } from 'styles/common';
import media from 'styles/media';
import { formatDateWithoutYear } from 'utils/formatters/date';

import { CompetitionState } from './CompetitionState';

type CompetitionBannerProps = {
	compact?: boolean;
	hideBanner?: boolean;
};

const formatedStartDate = formatDateWithoutYear(COMPETITION_DATES.START_DATE);
const formatedEndDate = formatDateWithoutYear(COMPETITION_DATES.END_DATE);
const competitionPeriod = `${formatedStartDate}-${formatedEndDate.split(' ')[1]}`;

export const CompetitionBanner: FC<CompetitionBannerProps> = memo(({ compact, hideBanner }) => {
	const { t } = useTranslation();

	if (!COMPETITION_ENABLED) return null;

	return (
		<BannerContainer compact={compact} hideBanner={hideBanner}>
			<CompetitionPeriod>{competitionPeriod}</CompetitionPeriod>
			<CompetitionState />
			<CTA href={EXTERNAL_LINKS.Competition.LearnMore}>{t('common.learn-more')}</CTA>

			<StyledBg />
		</BannerContainer>
	);
});

const BannerContainer = styled.div<{ compact?: boolean; hideBanner?: boolean }>`
	position: relative;
	width: 100%;
	display: ${({ hideBanner }) => (hideBanner ? 'none' : 'flex')};
	margin-bottom: ${({ compact }) => (compact ? '5px' : '35px')};
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: transaparent;
	padding: 22px 0;
	border: ${(props) => props.theme.colors.selectedTheme.competitionBanner.border};
	border-radius: 8px;
	${media.lessThan('sm')`
		border-radius: 0;
		margin-bottom: 0;
	`}
	gap: 10px;
`;

const CompetitionPeriod = styled(Text.Body).attrs({ mono: true, variant: 'bold' })`
	font-style: normal;
	font-size: 13px;
	line-height: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin: 0;
`;

const CTA = styled(ExternalLink)`
	padding: 8px 11.5px;
	background: #ffb800;
	border-radius: 15px;
	border: none;
	font-family: ${(props) => props.theme.fonts.bold};
	font-style: normal;
	font-size: 13px;
	line-height: 8px;
	color: #ffb800;
	background-color: #252525;
	text-transform: capitalize;
	transition: color 0.2s, background-color 0.2s;

	&:hover {
		cursor: pointer;
		color: #171002;
		background-color: #ffb800;
	}
`;

const StyledBg = styled(CompetitionBannerBg)`
	width: 100%;
	height: 100%;

	/* prevent background-image from covering the text. */
	z-index: -1;

	position: absolute;
	top: 0;

	${media.lessThan('sm')`
		left: 50%;
		transform: translateX(-50%);
	`}

	& > g {
		stroke: ${(props) => props.theme.colors.selectedTheme.competitionBanner.bg};
	}
`;
