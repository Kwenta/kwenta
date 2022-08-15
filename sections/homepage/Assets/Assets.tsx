import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';

import AssetCollections from 'assets/png/marketing/asset-collections.png';
import Fade from 'assets/svg/marketing/fade.svg';

import { FlexDivCentered, FlexDivRowCentered, Paragraph } from 'styles/common';
import media, { Media } from 'styles/media';

import SmoothScroll from 'sections/homepage/containers/SmoothScroll';

import { GridContainer, SubHeader } from '../common';

const ASSETS = [
	{
		id: 'index',
		label: 'homepage.assets.index',
	},
	{
		id: 'forex',
		label: 'homepage.assets.forex',
	},
	{
		id: 'crypto',
		label: 'homepage.assets.crypto',
	},
	{
		id: 'commodity',
		label: 'homepage.assets.commodity',
	},
	{
		id: 'short',
		label: 'homepage.assets.short',
	},
];

const Assets = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();

	const title = <LeftSubHeader>{t('homepage.assets.title')}</LeftSubHeader>;
	const assetCards = (
		<GridContainer>
			{ASSETS.map(({ id, label }) => (
				<AssetCard key={id}>
					<Bullet />
					<AssetCardText>{t(label)}</AssetCardText>
				</AssetCard>
			))}
		</GridContainer>
	);

	return (
		<Container ref={whyKwentaRef}>
			<Media greaterThanOrEqual="lg">
				<FlexDivRowCentered>
					<AssetCollectionWrapper>
						<AssetsImage src={AssetCollections} alt="" webp={true} />
						<Svg src={Fade} />
					</AssetCollectionWrapper>
					<Col>
						{title}
						{assetCards}
					</Col>
				</FlexDivRowCentered>
			</Media>
			<Media lessThan="lg">
				{title}
				<MobileImage src={AssetCollections} alt="" webp={true} />
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
	background: ${(props) => props.theme.colors.elderberry};
	border: ${(props) => `1px solid ${props.theme.colors.black}`};
	box-sizing: border-box;
	border-radius: 3px;
	padding: 16px;
`;

const AssetCardText = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	margin: 0px 0px 0px 16px;
	text-align: center;
`;

const AssetsImage = styled(Img)`
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

export const Bullet = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background: ${(props) => props.theme.colors.gold};
`;

export default Assets;
