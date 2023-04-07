import Head from 'next/head';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import RewardsPortfolio from 'sections/dashboard/Rewards/RewardsTabs';
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { fetchClaimableRewards, fetchEscrowData, fetchStakingData } from 'state/staking/actions';

type RewardsComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const RewardsPage: RewardsComponent = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const walletAddress = useAppSelector(({ wallet }) => wallet.walletAddress);

	useEffect(() => {
		if (!!walletAddress) {
			dispatch(fetchStakingData()).then(() => {
				dispatch(fetchClaimableRewards());
			});
			dispatch(fetchEscrowData());
		}
	}, [dispatch, walletAddress]);

	return (
		<>
			<Head>
				<title>{t('dashboard-rewards.page-title')}</title>
			</Head>
			<RewardsPortfolio />
		</>
	);
};

RewardsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default RewardsPage;
