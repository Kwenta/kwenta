import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivColCentered, SmallGoldenHeader, WhiteHeader } from 'styles/common';
import media, { Media } from 'styles/media';
import SmoothScroll from 'sections/homepage/containers/SmoothScroll';

const ShortList = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.shortlist.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.shortlist.description')}</WhiteHeader>
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

const AssetsImage = styled.img`
	max-width: 500px;
	width: 100%;
`;

export const Bullet = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background: ${(props) => props.theme.colors.gold};
`;

export default ShortList;
