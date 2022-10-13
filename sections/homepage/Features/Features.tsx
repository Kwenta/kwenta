import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import OpenSourceIcon from 'assets/png/features/opensource.png';
import BlazingFastIcon from 'assets/svg/features/blazing-fast.svg';
import EasyRampingIcon from 'assets/svg/features/easy-ramping.svg';
import LowGasFeeIcon from 'assets/svg/features/low-gas-fee.svg';
import MobileIcon from 'assets/svg/features/mobile.svg';
import UniqueAssetsIcon from 'assets/svg/features/unique-assets.svg';
import ZeroSlippageIcon from 'assets/svg/features/zero-slippage.svg';
import AelinIcon from 'assets/svg/partners/aelin.svg';
import ChainLinkIcon from 'assets/svg/partners/chainlink.svg';
import GraphIcon from 'assets/svg/partners/graph.svg';
import HopIcon from 'assets/svg/partners/hop.svg';
import LyraIcon from 'assets/svg/partners/lyra.svg';
import OptimismIcon from 'assets/svg/partners/optimism.svg';
import SynthetixIcon from 'assets/svg/partners/synthetix.svg';
import ThalesIcon from 'assets/svg/partners/thales.svg';
import {
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	GridDivCentered,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import media from 'styles/media';

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
		key: 'open-source',
		title: 'homepage.features.open-source.title',
		copy: 'homepage.features.open-source.copy',
		image: <Image src={OpenSourceIcon} layout="fixed" height="64px" width="64px" />,
	},
	{
		key: 'mobile',
		title: 'homepage.features.mobile.title',
		copy: 'homepage.features.mobile.copy',
		image: <MobileIcon />,
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
			<BigWhiteHeader>{t('homepage.features.description')}</BigWhiteHeader>
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
	${media.lessThan('sm')`
		width: 183px;
	`}
`;

const FeatureTitle = styled(Title)`
	font-size: 24px;
	line-height: 100%;
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.white};
	text-shadow: 0px 0px 12.83px rgba(255, 255, 255, 0.2);
	width: 150px;
	${media.lessThan('sm')`
		font-size: 20px;
	`}
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	margin: auto;
	margin-top: 60px;
	gap: 20px 20px;
	width: 826px;
	flex-wrap: wrap;
	justify-content: center;

	${media.lessThan('sm')`
		flex-direction: column;
		width: 305px;
	`}
`;

const FeatureCard = styled(FlexDivRow)`
	background-color: #1a1a1a;
	border-radius: 10px;
	padding: 30px;
	border: 1px solid rgba(255, 255, 255, 0.05);
	transition: all 0.2s ease-in-out;

	:hover {
		background-color: #202020;
	}

	${media.lessThan('sm')`
		width: 305px;
		height: auto;
		align-items: center; 
		padding: 20px 40px 20px 20px;
	`}
`;

const IconGridContainer = styled(GridDivCentered)`
	place-items: center;
	justify-content: center;
	grid-template-rows: 150px 150px;
	grid-template-columns: repeat(4, 200px);
	gap: 20px 20px;
	margin-top: 40px;

	.lyra {
		svg {
			width: 80px;
		}
	}

	.synthetix {
		svg {
			width: 120px;
		}
	}
	.aelin {
		svg {
			width: 95px;
		}
	}

	.thales {
		svg {
			width: 95px;
		}
	}

	.graph {
		svg {
			width: 40px;
		}
	}

	.hop {
		svg {
			width: 90px;
		}
	}

	.chainlink {
		svg {
			width: 100px;
		}
	}

	${media.lessThan('sm')`
		grid-template-rows: repeat(4, 100px);
		grid-template-columns: repeat(2, 140px);

		.hop {
			svg {
				width: 70px;
			}
		}
		.optimism {
			svg {
				width: 80px;
			}
		}
		.aelin {
			svg {
				width: 80px;
			}
		}
		.synthetix {
			svg {
				width: 85px;
			}
		}
		.thales {
			svg {
				width: 80px;
			}
		}
		.chainlink {
			svg {
				width: 85px;
			}
		}
		.graph {
			svg {
				width: 35px;
			}
		}
		.lyra {
			svg {
				width: 30px;
			}
		}
	`}
`;

const PartnerIconContainer = styled.div`
	background-color: #1a1a1a;
	border-radius: 8px;
	place-items: center;
	width: 100%;
	height: 100%;
	display: grid;
	border: 1px solid rgba(255, 255, 255, 0.05);
	transition: all 0.2s ease-in-out;

	:hover {
		background-color: #202020;
	}
`;

const Container = styled.div`
	margin: 140px 0px;
`;

const FeatureIconContainer = styled.div`
	img,
	svg {
		width: 64px;
		height: 64px;
	}
	${media.lessThan('sm')`
		padding-bottom: 0px;
	`}
`;

const FeatureContentContainer = styled(FlexDivCol)`
	margin-left: 20px;
	${media.lessThan('sm')`
		width: 305px;
		height: auto;
		padding-top: 0px;
	`}
`;

const FeatureContentTitle = styled(FlexDivRow)`
	padding-bottom: 5px;
`;

const ComingSoonTag = styled(FlexDivCentered)`
	width: 50px;
	height: 24px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin-left: 16px;
	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 8px;
	border: 1px solid #9c6c3c;
	cursor: default;

	${media.lessThan('sm')`
		margin-left: -16px;
	`}
`;

const SectionFeatureTitle = styled(FeatureTitle)`
	margin-top: 80px;
	text-align: center;
	width: 500px;
	${media.lessThan('sm')`
		width: 100vw;
	`}
`;

const SectionFeatureCopy = styled(FeatureCopy)`
	margin-top: 16px;
	text-align: center;
	width: 500px;
	font-size: 18px;
	${media.lessThan('sm')`
		width: 333px;
	`}
`;

const BigWhiteHeader = styled(WhiteHeader)`
	${media.lessThan('sm')`
		width: 336px;
	`}
`;

export default Features;
