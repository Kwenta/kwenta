import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivCentered, FlexDivRowCentered, Paragraph } from 'styles/common';
import AssetCollections from 'assets/png/marketing/asset-collections.png';
import AssetDotPoint from 'assets/inline-svg/marketing/asset-card-dot.svg';

import media from 'styles/media';

import { GridContainer, SubHeader } from '../common';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

const Assets = () => {
	const { t } = useTranslation();
	const assets = t('homepage.assets.list', { returnObjects: true }) as string[];

	const title = <LeftSubHeader>{t('homepage.assets.title')}</LeftSubHeader>;
	const assetCards = (
		<GridContainer>
			{assets.map((text, idx) => (
				<AssetCard key={idx}>
					<AssetDotPoint />
					<AssetCardText>{text}</AssetCardText>
				</AssetCard>
			))}
		</GridContainer>
	);

	return (
		<Container id="why">
			<DesktopOnlyView>
				<FlexDivRowCentered>
					<AssetCollectionWrapper>
						<AssetsImage src={AssetCollections} alt="" />
						{/* <Fade /> */}
					</AssetCollectionWrapper>
					<Col>
						{title}
						{assetCards}
					</Col>
				</FlexDivRowCentered>
			</DesktopOnlyView>
			<MobileOrTabletView>
				{title}
				<MobileImage src={AssetCollections} alt="" />
				{assetCards}
			</MobileOrTabletView>
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 150px;
`;

const LeftSubHeader = styled(SubHeader)`
	text-align: left;
	max-width: 500px;
	${media.lessThan('md')`
		max-width: unset;
		text-align: center;
	`}
`;

const AssetCollectionWrapper = styled.div`
	position: relative;
	flex-shrink: 0;
	svg {
		position: absolute;
		left: 0;
		top: 0;
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
