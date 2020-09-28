import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivCentered, FlexDivCol, Paragraph } from 'styles/common';
// import AssetCollections from 'assets/svg/marketing/asset-collections.svg';
import AssetCollections from 'assets/png/marketing/asset-collections.png';
import Fade from 'assets/inline-svg/marketing/fade.svg';
import AssetDotPoint from 'assets/inline-svg/marketing/asset-card-dot.svg';

import media from 'styles/media';

import { FlexSection, GridContainer, SubHeader } from '../common';
import { DesktopOnlyView } from 'components/Media';

const Assets = () => {
	const { t } = useTranslation();
	const assets = t('homepage.assets.list', { returnObjects: true }) as string[];

	return (
		<StyledFlexSection id="why">
			<AssetCollectionWrapper>
				<img src={AssetCollections} alt="" style={{ width: '100%', maxWidth: '700px' }} />
				<DesktopOnlyView>
					<Fade />
				</DesktopOnlyView>
			</AssetCollectionWrapper>
			<Col>
				<LeftSubHeader>{t('homepage.assets.title')}</LeftSubHeader>
				<GridContainer>
					{assets.map((text, idx) => (
						<AssetCard key={idx}>
							<AssetDotPoint />
							<AssetCardText>{text}</AssetCardText>
						</AssetCard>
					))}
				</GridContainer>
			</Col>
		</StyledFlexSection>
	);
};

const StyledFlexSection = styled(FlexSection)`
	padding-bottom: 150px;
	${media.lessThan('md')`
		flex-direction: column;
	`}
`;

const LeftSubHeader = styled(SubHeader)`
	text-align: left;
`;

const AssetCollectionWrapper = styled.div`
	position: relative;
	width: 100%;
	max-width: 50%;
	margin: 0 auto;
	svg {
		position: absolute;
		left: 0;
		top: 0;
	}
`;

const Col = styled(FlexDivCol)``;

const AssetCard = styled(FlexDivCentered)`
	background: #0d0d18;
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

export default Assets;
