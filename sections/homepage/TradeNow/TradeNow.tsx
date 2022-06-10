import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import ROUTES from 'constants/routes';
import { FlexDivColCentered, Paragraph, SmallGoldenHeader, WhiteHeader } from 'styles/common';
import { Media } from 'styles/media';

const TradeNow = () => {
	const { t } = useTranslation();

	const title = (
		<TransparentCard>
			<SmallGoldenHeader>{t('homepage.tradenow.title')}</SmallGoldenHeader>
			<BigWhiteHeader>{t('homepage.tradenow.description')}</BigWhiteHeader>
			<GrayDescription>{t('homepage.tradenow.categories')}</GrayDescription>
			<CTAContainer>
				<Link href={ROUTES.Markets.Home}>
					<Button variant="primary" isRounded={false} size="md">
						{t('homepage.nav.trade-now')}
					</Button>
				</Link>
			</CTAContainer>
		</TransparentCard>
	);

	return (
		<Container>
			<Media greaterThanOrEqual="lg">
				<FlexDivColCentered>{title}</FlexDivColCentered>
			</Media>
			<Media lessThan="lg">{title}</Media>
		</Container>
	);
};

const TransparentCard = styled.div`
	padding: 140px 303px;
	box-sizing: border-box;
	text-align: center;
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
`;
const Container = styled.div`
	margin-bottom: 140px;
`;

const GrayDescription = styled(Paragraph)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 24px;
	line-height: 120%;
	text-align: center;
	margin-top: 30px;
`;

const CTAContainer = styled.div`
	margin: 50px 0px 0px 0;
	z-index: 1;
`;

const BigWhiteHeader = styled(WhiteHeader)`
	font-size: 60px;
	width: 600px;
`;

export default TradeNow;
