import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivCentered, FlexDivRowCentered, Paragraph } from 'styles/common';
// import AssetCollections from 'assets/svg/marketing/asset-collections.svg';
import AssetCollections from 'assets/png/marketing/asset-collections.png';
import Fade from 'assets/inline-svg/marketing/fade.svg';
import CommoditiesIcon from 'assets/inline-svg/marketing/icon-commodities.svg';
import CryptoIcon from 'assets/inline-svg/marketing/icon-crypto.svg';
import EquitiesIcon from 'assets/inline-svg/marketing/icon-equities.svg';
import ForexIcon from 'assets/inline-svg/marketing/icon-forex.svg';
import IndicesIcon from 'assets/inline-svg/marketing/icon-indices.svg';
import ShortIcon from 'assets/inline-svg/marketing/icon-short.svg';

import media from 'styles/media';
import { Media } from 'styles/media';

import { GridContainer, SubHeader } from '../common';

const ASSETS = [
	{
		id: 'index',
		image: <IndicesIcon />,
		label: 'homepage.assets.index',
	},
	{
		id: 'forex',
		image: <ForexIcon />,
		label: 'homepage.assets.forex',
	},
	{
		id: 'equities',
		image: <EquitiesIcon />,
		label: 'homepage.assets.equities',
	},
	{
		id: 'crypto',
		image: <CryptoIcon />,
		label: 'homepage.assets.crypto',
	},
	{
		id: 'commodity',
		image: <CommoditiesIcon />,
		label: 'homepage.assets.commodity',
	},
	{
		id: 'short',
		image: <ShortIcon />,
		label: 'homepage.assets.short',
	},
];

const Assets = () => {
	const { t } = useTranslation();

	const title = <LeftSubHeader>{t('homepage.assets.title')}</LeftSubHeader>;
	const assetCards = (
		<GridContainer>
			{ASSETS.map(({ id, label, image }) => (
				<AssetCard key={id}>
					{image}
					<AssetCardText>{t(label)}</AssetCardText>
				</AssetCard>
			))}
		</GridContainer>
	);

	return (
		<Container id="why">
			<Media greaterThanOrEqual="lg">
				<FlexDivRowCentered>
					<AssetCollectionWrapper>
						<AssetsImage src={AssetCollections} alt="" />
						<Fade />
					</AssetCollectionWrapper>
					<Col>
						{title}
						{assetCards}
					</Col>
				</FlexDivRowCentered>
			</Media>
			<Media lessThan="lg">
				{title}
				<MobileImage src={AssetCollections} alt="" />
				{assetCards}
			</Media>
		</Container>
	);
};

const Container = styled.div`
	padding-top: 80px;
	${media.lessThan('md')`
		padding-top: 40px;
	`}
	padding-bottom: 150px;
`;

const LeftSubHeader = styled(SubHeader)`
	text-align: left;
	max-width: 500px;
	${media.lessThan('lg')`
		max-width: unset;
		text-align: center;
	`}
`;

const AssetCollectionWrapper = styled.div`
	position: relative;
	flex-shrink: 0;
	svg {
		display: none;
		${media.between('lg', 'xl')`
			display: unset;
			position: absolute;
			left: -50px;
			top: -120px;
			pointer-events: none;
		`}
	}
`;

const Col = styled.div`
	display: grid;
	grid-gap: 80px;
`;

const AssetCard = styled(FlexDivCentered)`
	background: #0d0d18;
	border: ${(props) => `1px solid ${props.theme.colors.black}`};
	box-sizing: border-box;
	border-radius: 3px;
	padding: 10px;
`;

const AssetCardText = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	margin: 0px 0px 0px 16px;
	text-align: center;
`;

const AssetsImage = styled.img`
	max-width: 500px;
	width: 100%;
`;

const MobileImage = styled(AssetsImage)`
	margin: 0 auto;
	display: block;
	margin-top: 50px;
	margin-bottom: 80px;
	${media.lessThan('sm')`
		width: 100%;
		margin-bottom: 60px;
	`}
`;

export default Assets;
