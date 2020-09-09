import { useState } from 'react';
import styled from 'styled-components';

import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { FlexDiv, CapitalizedText } from 'styles/common';
import TabButton from 'components/TabButton';

const TABS = {
	SYNTH_BALANCES: 'synth-balances',
	CONVERT: 'convert',
	CRYPTO_BALANCES: 'crypto-balances',
	TRANSACTIONS: 'transactions',
};

const SynthBalances = () => <>Synth Balances</>;

const DashboardPage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(TABS.SYNTH_BALANCES);
	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<CardsContainer>
				<LeftCardContainer>
					<CapitalizedText>
						<div>{t('dashboard.your-profile.title')}</div>
						<div>
							<TabButton
								active={activeTab === TABS.SYNTH_BALANCES}
								onClick={() => setActiveTab(TABS.SYNTH_BALANCES)}
							>
								{t('dashboard.tabs.nav.synth-balances')}
							</TabButton>
							<TabButton
								active={activeTab === TABS.CONVERT}
								onClick={() => setActiveTab(TABS.CONVERT)}
							>
								{t('dashboard.tabs.nav.convert')}
							</TabButton>
							<TabButton
								active={activeTab === TABS.CRYPTO_BALANCES}
								onClick={() => setActiveTab(TABS.CRYPTO_BALANCES)}
							>
								{t('dashboard.tabs.nav.crypto-balances')}
							</TabButton>
							<TabButton
								active={activeTab === TABS.TRANSACTIONS}
								onClick={() => setActiveTab(TABS.TRANSACTIONS)}
							>
								{t('dashboard.tabs.nav.transactions')}
							</TabButton>
						</div>
						<div>{activeTab === TABS.SYNTH_BALANCES && <SynthBalances />}</div>
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
