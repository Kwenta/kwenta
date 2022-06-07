import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BlazingFastIcon from 'assets/svg/features/blazing-fast.svg';
import LowGasFeeIcon from 'assets/svg/features/low-gas-fee.svg';
import UniqueAssetsIcon from 'assets/svg/features/unique-assets.svg';
import PermissionlessIcon from 'assets/png/features/permissionless.png';
import MobileIcon from 'assets/svg/features/mobile.svg';
import EasyRampingIcon from 'assets/svg/features/easy-ramping.svg';
import ZeroSlippageIcon from 'assets/svg/features/zero-slippage.svg';
import SynthetixIcon from 'assets/svg/partners/synthetix.svg';
import LyraIcon from 'assets/svg/partners/lyra.svg';
import AelinIcon from 'assets/svg/partners/aelin.svg';
import ThalesIcon from 'assets/svg/partners/thales.svg';
import OptimismIcon from 'assets/svg/partners/optimism.svg';
import GraphIcon from 'assets/svg/partners/graph.svg';
import HopIcon from 'assets/svg/partners/hop.svg';
import ChainLinkIcon from 'assets/svg/partners/chainlink.svg';
import {
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	GridDivCentered,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import { Copy, Title } from '../common';

const FEATURES = [
	{
		key: 'blazing-fast',
		title: 'homepage.features.blazing-fast.title',
		copy: 'homepage.features.blazing-fast.copy',
		image: <BlazingFastIcon />,
	},
	{
		key: 'low-gas-fees',
		title: 'homepage.features.low-gas-fees.title',
		copy: 'homepage.features.low-gas-fees.copy',
		image: <LowGasFeeIcon />,
	},
	{
		key: 'unique-assets',
		title: 'homepage.features.unique-assets.title',
		copy: 'homepage.features.unique-assets.copy',
		image: <UniqueAssetsIcon />,
	},
	{
		key: 'permissionless',
		title: 'homepage.features.permissionless.title',
		copy: 'homepage.features.permissionless.copy',
		image: <img src={PermissionlessIcon} />,
	},
	{
		key: 'mobile',
		title: 'homepage.features.mobile.title',
		copy: 'homepage.features.mobile.copy',
		image: <MobileIcon />,
		comingSoon: true,
	},
	{
		key: 'easy-ramping',
		title: 'homepage.features.easy-ramping.title',
		copy: 'homepage.features.easy-ramping.copy',
		image: <EasyRampingIcon />,
		comingSoon: true,
	},
	{
		key: 'zero-slippage',
		title: 'homepage.features.zero-slippage.title',
		copy: 'homepage.features.zero-slippage.copy',
		image: <ZeroSlippageIcon />,
	},
];

const PARTNERS = [
	{
		key: 'synthetix',
		image: <SynthetixIcon />,
	},
	{
		key: 'lyra',
		image: <LyraIcon />,
	},
	{
		key: 'aelin',
		image: <AelinIcon />,
	},
	{
		key: 'thales',
		image: <ThalesIcon />,
	},
	{
		key: 'optimism',
		image: <OptimismIcon />,
	},
	{
		key: 'graph',
		image: <GraphIcon />,
	},
	{
		key: 'hop',
		image: <HopIcon />,
	},
	{
		key: 'chainlink',
		image: <ChainLinkIcon />,
	},
];

const Features = () => {
	const { t } = useTranslation();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.features.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.features.description')}</WhiteHeader>
		</>
	);

	const sectionTitle = (
		<>
			<SectionFeatureTitle>{t('homepage.features.partners.title')}</SectionFeatureTitle>
			<SectionFeatureCopy>{t('homepage.features.partners.copy')}</SectionFeatureCopy>
		</>
	);

	return (
		<Container>
			<FlexDivColCentered>{title}</FlexDivColCentered>
			<StyledFlexDivRow>
				{FEATURES.map(({ key, title, comingSoon, copy, image }) => (
					<FeatureCard key={key}>
						<FeatureIconContainer>{image}</FeatureIconContainer>
						<FeatureContentContainer>
							<FeatureContentTitle>
								<FeatureTitle>{t(title)}</FeatureTitle>
								{comingSoon && <ComingSoonTag>{t('common.features.coming-soon')}</ComingSoonTag>}
							</FeatureContentTitle>
							<FeatureCopy>{t(copy)}</FeatureCopy>
						</FeatureContentContainer>
					</FeatureCard>
				))}
			</StyledFlexDivRow>
			<FlexDivColCentered>{sectionTitle}</FlexDivColCentered>
			<IconGridContainer>
				{PARTNERS.map(({ key, image }) => (
					<PartnerIconContainer key={key} className={key}>
						{image}
					</PartnerIconContainer>
				))}
			</IconGridContainer>
		</Container>
	);
};

const FeatureCopy = styled(Copy)`
	font-size: 15px;
	line-height: 150%;
	letter-spacing: -0.04em;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	width: 250px;
`;

const FeatureTitle = styled(Title)`
	font-size: 24px;
	line-height: 100%;
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.white};
	text-shadow: 0px 0px 12.83px rgba(255, 255, 255, 0.2);
	width: 150px;
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	margin: auto;
	margin-top: 60px;
	gap: 20px 20px;
	width: 826px;
	flex-wrap: wrap;
	justify-content: center;
`;

const IconGridContainer = styled(GridDivCentered)`
	place-items: center;
	justify-content: center;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: repeat(4, 280px);
	gap: 80px 20px;
	margin-top: 80px;
	svg {
		width: 128px;
		height: 64px;
	}
`;

const Container = styled.div`
	margin: 140px 0px;
`;

const FeatureCard = styled(FlexDivRow)`
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	padding: 32px 80px 32px 32px;
	width: 403px;
	height: 135px;
`;

const PartnerIconContainer = styled.div`
	place-self: center;
	svg {
		width: 128px;
		height: 64px;
	}
`;

const FeatureIconContainer = styled.div`
	padding-bottom: 40px;
	img,
	svg {
		width: 64px;
		height: 64px;
	}
`;

const FeatureContentContainer = styled(FlexDivCol)`
	margin-left: 20px;
`;

const FeatureContentTitle = styled(FlexDivRow)`
	padding-bottom: 12px;
`;

const ComingSoonTag = styled(FlexDivCentered)`
	width: 50px;
	height: 24px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin-left: 16px;
	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 8px;
	border: 1px solid #9c6c3c;
`;

const SectionFeatureTitle = styled(FeatureTitle)`
	margin-top: 80px;
	text-align: center;
	width: 500px;
`;

const SectionFeatureCopy = styled(FeatureCopy)`
	margin-top: 16px;
	text-align: center;
	width: 500px;
	font-size: 18px;
`;

export default Features;
