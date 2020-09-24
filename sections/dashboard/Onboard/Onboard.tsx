import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { EXTERNAL_LINKS } from 'constants/links';

import Button from 'components/Button';

import { FlexDivCol } from 'styles/common';
import { fonts } from 'styles/theme/fonts';

import { CardTitle, ConvertContainer } from '../common';

import CurrencyConvertCard from '../CurrencyConvertCard';

const Onboard = () => {
	const { t } = useTranslation();

	return (
		<FlexDivCol>
			<Title>{t('dashboard.onboard.title')}</Title>
			<Subtitle>{t('dashboard.onboard.subtitle')}</Subtitle>
			<Center>
				<Button variant="primary" isRounded={true} size="lg">
					<a href={EXTERNAL_LINKS.Learn.MainSite} target="_blank" rel="noreferrer">
						{t('dashboard.onboard.learnMore')}
					</a>
				</Button>
			</Center>
			<ConvertContainer>
				<StyledCardTitle>{t('dashboard.onboard.convert')}</StyledCardTitle>
				<CurrencyConvertCard />
			</ConvertContainer>
		</FlexDivCol>
	);
};

const Title = styled.div`
	${fonts.body.boldSmall};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: uppercase;
	text-align: center;
	padding-bottom: 8px;
`;

const Subtitle = styled.div`
	${fonts.heading.h4};
	color: ${(props) => props.theme.colors.white};
	text-align: center;
	margin-bottom: 33px;
`;

export const Center = styled.div`
	margin: 0 auto;
	margin-bottom: 100px;
`;

const StyledCardTitle = styled(CardTitle)`
	padding-bottom: 2px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	margin-bottom: 24px;
`;

export default Onboard;
