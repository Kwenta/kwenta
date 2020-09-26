import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivCentered, FlexDivCol } from 'styles/common';
import AssetCollections from 'assets/svg/marketing/asset-collections.svg';
import AssetDotPoint from 'assets/inline-svg/marketing/asset-card-dot.svg';

import { FlexSection, GridContainer } from '../common';

const ASSETS = [
	{
		id: 'equities',
		copy: 'homepage.assets.equities',
	},
	{
		id: 'indices',
		copy: 'homepage.assets.indices',
	},
	{
		id: 'stablecoins',
		copy: 'homepage.assets.stablecoins',
	},
	{
		id: 'cryptocurrencies',
		copy: 'homepage.assets.cryptocurrencies',
	},
];

const Assets = () => {
	const { t } = useTranslation();

	return (
		<FlexSection>
			<AssetCollectionWrapper>
				<img src={AssetCollections} alt="" />
			</AssetCollectionWrapper>
			<Col>
				<LeftSubHeader>{t('homepage.assets.title')}</LeftSubHeader>
				<GridContainer>
					{ASSETS.map(({ id, copy }) => (
						<AssetCard key={id}>
							<AssetDotPoint />
							<AssetCardText>{t(copy)}</AssetCardText>
						</AssetCard>
					))}
				</GridContainer>
			</Col>
		</FlexSection>
	);
};

const SubHeader = styled.p`
	font-size: 64px;
	font-weight: 400;
	line-height: 120%;
	letter-spacing: 0.2px;
	width: 75%;
	color: ${(props) => props.theme.colors.white};
`;

const LeftSubHeader = styled(SubHeader)`
	text-align: left;
`;

const AssetCollectionWrapper = styled.div`
	width: 50%;
	margin-left: -20px;
`;

const Col = styled(FlexDivCol)`
	width: 50%;
	margin: 64px;
`;

const AssetCard = styled(FlexDivCentered)`
	background: #0d0d18;
	border: ${(props) => `1px solid ${props.theme.colors.black}`};
	box-sizing: border-box;
	border-radius: 3px;
	padding: 16px;
`;

const AssetCardText = styled.p`
	font-weight: 800;
	font-size: 16px;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	margin: 0px 0px 0px 16px;
	text-align: center;
`;

export default Assets;
