import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import Overview from 'sections/dashboard/Overview';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { fetchRedeemableBalances } from 'state/exchange/actions';
import { usePollDashboardFuturesData } from 'state/futures/hooks';
import { useAppSelector, useFetchAction } from 'state/hooks';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';

type DashboardComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation();
	const wallet = useAppSelector(selectWallet);
	const network = useAppSelector(selectNetwork);

	usePollDashboardFuturesData();
	useFetchAction(fetchRedeemableBalances, { dependencies: [wallet, network], disabled: !wallet });

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Overview />
			<GitHashID />
		</>
	);
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
