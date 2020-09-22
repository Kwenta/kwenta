import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol } from 'styles/common';
import { fonts } from 'styles/theme/fonts';
import Button from 'components/Button';

import { Center, CardTitle } from '../common';

const NoSynthsCard = () => {
	const { t } = useTranslation();

	return (
		<FlexDivCol>
			<NoSynthTitle>{t('dashboard.no-synths-card.title')}</NoSynthTitle>
			<NoSynthSubtitle>{t('dashboard.no-synths-card.subtitle')}</NoSynthSubtitle>
			<Center>
				<Button variant="primary" isRounded={true} size="lg">
					{t('dashboard.no-synths-card.learnMore')}
				</Button>
			</Center>
			<CardTitle>{t('dashboard.no-synths-card.convert')}</CardTitle>
		</FlexDivCol>
	);
};

const NoSynthTitle = styled.div`
	${fonts.data.small}
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: uppercase;
	text-align: center;
	margin-bottom: 4px;
`;

const NoSynthSubtitle = styled.div`
	${fonts.heading.h4}
	color: ${(props) => props.theme.colors.white};
	text-align:center;
	margin-bottom: 33px;
`;

export default NoSynthsCard;
