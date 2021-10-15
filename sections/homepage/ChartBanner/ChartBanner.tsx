import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Img from 'react-optimized-image';

import ChartBanner from 'assets/png/marketing/chart-banner.png';

import Button from 'components/Button';

import media from 'styles/media';

import { AbsoluteCenteredDiv, FlexDivCentered } from 'styles/common';
import { StackSection, Subtext } from '../common';
import Link from 'next/link';
import ROUTES from 'constants/routes';

const FAQ = () => {
	const { t } = useTranslation();

	return (
		<StyledStackSection>
			<ChartGraphicContainer>
				<ChartBannerImage src={ChartBanner} alt="" webp={true} />
				<OverlayText>
					<StyledSubtext>{t('homepage.footer.cta.title')}</StyledSubtext>
					<Link href={ROUTES.Home}>
						<Button variant="primary" size="lg">
							{t('homepage.footer.cta.button')}
						</Button>
					</Link>
				</OverlayText>
			</ChartGraphicContainer>
		</StyledStackSection>
	);
};

const StyledStackSection = styled(StackSection)`
	padding-top: 300px;
	${media.lessThan('sm')`
		padding-top: 280px;
	`}
`;

const ChartGraphicContainer = styled(FlexDivCentered)`
	position: relative;
	width: 100vw;
	justify-content: center;
	margin-bottom: -100%;
	transform: translateY(-50%);
	overflow: hidden;
`;

const OverlayText = styled(AbsoluteCenteredDiv)`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0 20px;
`;

const StyledSubtext = styled(Subtext)`
	padding-bottom: 32px;
`;

const ChartBannerImage = styled(Img)`
	max-width: 1440px;
`;

export default FAQ;
