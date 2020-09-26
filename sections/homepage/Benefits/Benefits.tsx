import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCol, FlexDivRowCentered } from 'styles/common';

import SwapPreview from 'assets/svg/marketing/swap-preview.svg';
import InfiniteLiquidity from 'assets/svg/marketing/infinite-liquidity.svg';
import TradingPairs from 'assets/svg/marketing/trading-pairs.svg';
import ZeroSlippage from 'assets/svg/marketing/zero-slippage.svg';

import { StackSection, CenterSubHeader, Title, Copy } from '../common';

const BENEFITS = [
	{
		id: 'infinite-liquidity',
		image: <img src={InfiniteLiquidity} alt="" />,
		title: 'homepage.second-hero.infinite-liquidity.title',
		copy: 'homepage.second-hero.infinite-liquidity.copy',
	},
	{
		id: 'zero-slippage',
		image: <img src={ZeroSlippage} alt="" />,
		title: 'homepage.second-hero.zero-slippage.title',
		copy: 'homepage.second-hero.zero-slippage.copy',
	},
	{
		id: 'trading-pairs',
		image: <img src={TradingPairs} alt="" />,
		title: 'homepage.second-hero.trading-pairs.title',
		copy: 'homepage.second-hero.trading-pairs.copy',
	},
];

const Benefits = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<CenterSubHeader>{t('homepage.second-hero.title')}</CenterSubHeader>
			<img src={SwapPreview} alt="" />
			<BenefitContainer>
				{BENEFITS.map(({ id, image, title, copy }) => (
					<BenefitCard key={id}>
						{image}
						<Title>{t(title)}</Title>
						<Copy>{t(copy)}</Copy>
					</BenefitCard>
				))}
			</BenefitContainer>
		</StackSection>
	);
};

const BenefitCard = styled(FlexDivCol)`
	align-items: flex-start;
	width: 33%;
	margin: 24px 16px;
`;

const BenefitContainer = styled(FlexDivRowCentered)`
	margin: 64px 0px;
	justify-content: center;
`;

export default Benefits;
