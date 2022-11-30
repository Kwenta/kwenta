import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import Overview from 'sections/dashboard/Overview';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { fetchMarkets } from 'state/futures/actions';
import { usePollWhenReady } from 'state/hooks';

type DashboardComponent = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation();
	usePollWhenReady('fetchMarkets', fetchMarkets);

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
