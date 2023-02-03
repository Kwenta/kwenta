import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { FlexDivColCentered } from 'components/layout/flex';
import * as Text from 'components/Text';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import ROUTES from 'constants/routes';
import { SmallGoldenHeader, WhiteHeader } from 'styles/common';
import media from 'styles/media';

const TradeNow = () => {
	const { t } = useTranslation();

	const title = (
		<TransparentCard>
			<SmallGoldenHeader>{t('homepage.tradenow.title')}</SmallGoldenHeader>
			<BigWhiteHeader>{t('homepage.tradenow.description')}</BigWhiteHeader>
			<GrayDescription>{t('homepage.tradenow.categories')}</GrayDescription>
			<CTAContainer>
				<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
					<Button variant="flat" textColor="yellow" size="md">
						{t('homepage.nav.trade-now')}
					</Button>
				</Link>
			</CTAContainer>
		</TransparentCard>
	);

	return (
		<Container>
			<FlexDivColCentered>{title}</FlexDivColCentered>
		</Container>
	);
};

const TransparentCard = styled.div`
	padding: 140px 303px;
	box-sizing: border-box;
	text-align: center;
	${media.greaterThan('sm')`
		background: radial-gradient(white, rgba(2, 225, 255, 0.3) 0px, transparent 280px),
			radial-gradient(white, rgba(201, 151, 90, 0.3) 0px, transparent 320px),
			linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
		background-size: 100% 200%, 100% 200%, 100% 100%;
		background-position: -650px -300px, 600px -450px, 0px 0px;
		background-repeat: no-repeat, no-repeat, repeat;
	`};
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	${media.lessThan('sm')`
		width: 345px;
		padding: 80px 20px;
		background: radial-gradient(white, rgba(2, 225, 255, 0.25) 0px, transparent 140px),
		radial-gradient(white, rgba(201, 151, 90, 0.25) 0px, transparent 200px),
		linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
		background-size: 100% 100%, 100% 100%, 100% 100%;
		background-position: -140px 50px, 140px -50px, 0px 0px;
		background-repeat: no-repeat, no-repeat, repeat;
	`};
`;

const Container = styled.div`
	margin-bottom: 140px;
	${media.lessThan('sm')`
		margin-bottom: 105px;
	`};
`;

const GrayDescription = styled(Text.Body)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 24px;
	line-height: 120%;
	text-align: center;
	margin-top: 30px;

	${media.lessThan('sm')`
		font-size: 16px;
	`};
`;

const CTAContainer = styled.div`
	margin: 50px 0px 0px 0;
	z-index: 1;
`;

const BigWhiteHeader = styled(WhiteHeader)`
	font-size: 60px;
	width: 600px;
	${media.lessThan('sm')`
		font-size: 40px;
	`};
`;

export default TradeNow;
