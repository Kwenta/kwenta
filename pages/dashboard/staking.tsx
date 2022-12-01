import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio';
import StakingTabs from 'sections/dashboard/Stake/StakingTabs';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { fetchEscrowData, fetchStakingData } from 'state/staking/actions';

type StakingComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const walletAddress = useAppSelector(({ wallet }) => wallet.walletAddress);
	const [currentTab, setCurrentTab] = useState(StakeTab.Staking);

	useEffect(() => {
		if (!!walletAddress) {
			dispatch(fetchStakingData());
			dispatch(fetchEscrowData());
		}
	}, [dispatch, walletAddress]);

	const handleChangeTab = useCallback(
		(tab: StakeTab) => () => {
			setCurrentTab(tab);
		},
		[]
	);

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio setCurrentTab={setCurrentTab} />
			<StakingTabs currentTab={currentTab} onChangeTab={handleChangeTab} />
		</>
	);
};

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default StakingPage;
