import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AssetCollections from 'assets/png/marketing/asset-collections.png';
import Fade from 'assets/svg/marketing/fade.svg';

import {
	FlexDivCentered,
	FlexDivColCentered,
	Paragraph,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import media, { Media } from 'styles/media';

import SmoothScroll from 'sections/homepage/containers/SmoothScroll';

import { GridContainer } from '../common';
import Webp from 'components/Webp';

const Assets = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.tradenow.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.tradenow.description')}</WhiteHeader>
		</>
	);

	return (
		<Container ref={whyKwentaRef}>
			<Media greaterThanOrEqual="lg">
				<FlexDivColCentered>{title}</FlexDivColCentered>
			</Media>
			<Media lessThan="lg">{title}</Media>
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

const AssetCollectionWrapper = styled.div`
	margin-top: 20px;
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

export const Bullet = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background: ${(props) => props.theme.colors.gold};
`;

export default Assets;
