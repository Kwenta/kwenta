import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import SwapPreview from 'assets/svg/marketing/swap-preview.svg';
import SwapPreviewMd from 'assets/svg/marketing/swap-preview-md.svg';
import ArrowIcon from 'assets/svg/marketing/arrow.svg';
import LayersIcon from 'assets/svg/marketing/layers.svg';
import CogIcon from 'assets/svg/marketing/cog.svg';

import { FlexDivCol } from 'styles/common';

import media from 'styles/media';

import { StackSection, CenterSubHeader, Title, Copy, StyledResponsiveImage } from '../common';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

const BENEFITS = [
	{
		id: 'peer-to-contract',
		image: <img src={ArrowIcon} alt="" />,
		title: 'homepage.benefits.peer-to-contract.title',
		copy: 'homepage.benefits.peer-to-contract.copy',
	},
	{
		id: 'trading-pair',
		image: <img src={CogIcon} alt="" />,
		title: 'homepage.benefits.trading-pair.title',
		copy: 'homepage.benefits.trading-pair.copy',
	},
	{
		id: 'permissionless',
		image: <img src={LayersIcon} alt="" />,
		title: 'homepage.benefits.permissionless.title',
		copy: 'homepage.benefits.permissionless.copy',
	},
];

const Benefits = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<StyledCenterSubHeader>{t('homepage.benefits.title')}</StyledCenterSubHeader>
			<DesktopOnlyView>
				<StyledResponsiveImage src={SwapPreview} alt="" />
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledResponsiveImage src={SwapPreviewMd} alt="" />
			</MobileOrTabletView>
			<BenefitContainer>
				{BENEFITS.map(({ id, image, title, copy }) => (
					<BenefitCard key={id}>
						{image}
						<StyledTitle>{t(title)}</StyledTitle>
						<Copy>{t(copy)}</Copy>
					</BenefitCard>
				))}
			</BenefitContainer>
		</StackSection>
	);
};

const StyledCenterSubHeader = styled(CenterSubHeader)`
	padding-bottom: 56px;
	max-width: 700px;
	${media.lessThan('lg')`
		max-width: 450px;
	`}
`;

const BenefitCard = styled(FlexDivCol)`
	align-items: flex-start;
`;

const StyledTitle = styled(Title)`
	padding-bottom: 14px;
	padding-top: 40px;
`;

const BenefitContainer = styled.div`
	display: grid;
	grid-auto-flow: column;
	align-items: baseline;
	margin: 100px 0px 140px 0;
	grid-gap: 40px;
	${media.lessThan('md')`
		margin: 80px 0;
		grid-auto-flow: unset;
		grid-template-columns: repeat(2, 1fr);
	`}
	${media.lessThan('sm')`
		grid-gap: 50px;
		grid-template-columns: auto;
		margin: 56px 0px 80px 0;
	`}
`;

export default Benefits;
