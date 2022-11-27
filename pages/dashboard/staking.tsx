import Head from 'next/head';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import StakingPortfolio from 'sections/dashboard/Stake/StakingPortfolio';
import StakingTabs from 'sections/dashboard/Stake/StakingTabs';
import { useAppDispatch } from 'state/hooks';
import { fetchStakingData } from 'state/staking/actions';

type StakingComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchStakingData());
	}, [dispatch]);

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio />
			<StakingTabs />
		</>
	);
};

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default StakingPage;
