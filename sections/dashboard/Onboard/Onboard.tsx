import { FC } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';

import { FlexDivCol } from 'styles/common';

import { CardTitle, ConvertContainer } from '../common';

import ROUTES from 'constants/routes';

import CurrencyConvertCard from '../CurrencyConvertCard';

const Onboard: FC = () => {
	const { t } = useTranslation();

	return (
		<FlexDivCol>
			<Title>{t('dashboard.onboard.title')}</Title>
			<Subtitle>{t('dashboard.onboard.subtitle')}</Subtitle>
			<Center>
				<Link href={ROUTES.Homepage.How}>
					<Button variant="primary" isRounded={true} size="lg">
						{t('dashboard.onboard.learn-more')}
					</Button>
				</Link>
			</Center>
			<ConvertContainer>
				<StyledCardTitle>{t('dashboard.onboard.convert')}</StyledCardTitle>
				<CurrencyConvertCard />
			</ConvertContainer>
		</FlexDivCol>
	);
};

const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: uppercase;
	text-align: center;
	padding-bottom: 8px;
`;

const Subtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 20px;
	line-height: 24px;
	color: ${(props) => props.theme.colors.white};
	text-align: center;
	margin-bottom: 33px;
`;

export const Center = styled.div`
	margin: 0 auto;
	margin-bottom: 100px;
`;

const StyledCardTitle = styled(CardTitle)`
	padding-bottom: 5px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	margin-bottom: 24px;
`;

export default Onboard;
