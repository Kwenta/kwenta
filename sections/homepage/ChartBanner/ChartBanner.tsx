import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// import ChartBanner from 'assets/svg/marketing/chart-banner.svg';
import ChartBanner from 'assets/png/marketing/chart-banner.png';

import Button from 'components/Button';

import media from 'styles/media';

import { AbsoluteCenteredDiv, FlexDivCentered } from 'styles/common';
import { StackSection, Subtext, StyledResponsiveImage } from '../common';

const FAQ = () => {
	const { t } = useTranslation();

	return (
		<StyledStackSection>
			<ChartGraphicContainer>
				<ChartBannerImage src={ChartBanner} alt="" />
				<OverlayText>
					<StyledSubtext>{t('homepage.footer.cta.title')}</StyledSubtext>
					<CTAButton variant="primary">{t('homepage.footer.cta.button')}</CTAButton>
				</OverlayText>
			</ChartGraphicContainer>
		</StyledStackSection>
	);
};

const StyledStackSection = styled(StackSection)`
	padding-top: 185px;
	${media.lessThan('sm')`
		padding-top: 160px;
	`}
`;

const ChartBannerImage = styled(StyledResponsiveImage)`
	${media.lessThan('lg')`
		width: unset;
	`}
`;

const ChartGraphicContainer = styled(FlexDivCentered)`
	position: relative;
	width: 100%;
	justify-content: center;
	margin-bottom: -100%;
	transform: translateY(-50%);
`;

const OverlayText = styled(AbsoluteCenteredDiv)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const StyledSubtext = styled(Subtext)`
	padding-bottom: 64px;
	${media.lessThan('sm')`
		padding-bottom: 32px;
	`}
`;

const CTAButton = styled(Button)``;

export default FAQ;
