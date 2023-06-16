import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import History from 'sections/dashboard/History';
import { usePollDashboardFuturesData } from 'state/futures/hooks';

type HistoryPageProps = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const HistoryPage: HistoryPageProps = () => {
	const { t } = useTranslation();
	usePollDashboardFuturesData();
	return (
		<>
			<Head>
				<title>{t('dashboard-history.page-title')}</title>
			</Head>
			<History />
		</>
	);
};

HistoryPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default HistoryPage;
