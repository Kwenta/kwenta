import { useState, FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';

import { FlexDivCol } from 'styles/common';

import { CardTitle, ConvertContainer } from '../common';

import CurrencyConvertCard from '../CurrencyConvertCard';

import HowItWorksModal from './HowItWorksModal';

const Onboard: FC = () => {
	const { t } = useTranslation();
	const [howItWorksModalOpened, setHowItWorksModalOpened] = useState<boolean>(false);

	return (
		<>
			<FlexDivCol>
				<Title>{t('dashboard.onboard.title')}</Title>
				<Subtitle>{t('dashboard.onboard.subtitle')}</Subtitle>
				<Center>
					<Button
						variant="primary"
						isRounded={true}
						size="lg"
						onClick={() => setHowItWorksModalOpened(true)}
					>
						{t('dashboard.onboard.learn-more')}
					</Button>
				</Center>
				<ConvertContainer>
					<StyledCardTitle>{t('dashboard.onboard.convert')}</StyledCardTitle>
					<CurrencyConvertCard />
				</ConvertContainer>
			</FlexDivCol>
			{howItWorksModalOpened && (
				<HowItWorksModal onDismiss={() => setHowItWorksModalOpened(false)} />
			)}
		</>
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
