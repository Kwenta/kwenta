import styled from 'styled-components';

import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { FlexDiv, CapitalizedText } from 'styles/common';

const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<CardsContainer>
				<LeftCardContainer>
					<CapitalizedText>
						<div>{t('dashboard.your-profile.title')}</div>
					</CapitalizedText>
				</LeftCardContainer>
				<RightCardContainer>
					<CapitalizedText>{t('dashboard.watchlist.title')}</CapitalizedText>
				</RightCardContainer>
			</CardsContainer>
		</>
	);
};

const CardsContainer = styled(FlexDiv)`
	justify-content: space-between;
	width: 100%;
`;

const LeftCardContainer = styled.div`
	flex: 1;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 0px;
`;

const RightCardContainer = styled.div`
	width: 356px;
	background-color: ${(props) => props.theme.colors.elderberry};
	padding: 48px 32px;
`;

export default DashboardPage;
