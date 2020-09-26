import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ChartBanner from 'assets/svg/marketing/chart-banner.svg';

import Button from 'components/Button';

import { AbsoluteCenteredDiv, FlexDivCentered } from 'styles/common';
import { StackSection, Subtext } from '../common';

const FAQ = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<ChartGraphicContainer>
				<img src={ChartBanner} alt="" />
				<OverlayText>
					<Subtext>{t('homepage.footer.cta.title')}</Subtext>
					<CTAButton variant="primary">{t('homepage.footer.cta.button')}</CTAButton>
				</OverlayText>
			</ChartGraphicContainer>
		</StackSection>
	);
};

const ChartGraphicContainer = styled(FlexDivCentered)`
	position: relative;
	width: 100%;
	justify-content: center;
	margin-bottom: -240px;
`;

const OverlayText = styled(AbsoluteCenteredDiv)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const CTAButton = styled(Button)`
	color: ${(props) => props.theme.colors.black};
	background: ${(props) => props.theme.colors.white};
	width: 50%;
`;

export default FAQ;
