import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import Connector from 'containers/Connector';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import Markets from 'sections/dashboard/Markets';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { fetchMarkets } from 'state/futures/actions';
import { usePollAction } from 'state/hooks';

type MarketsProps = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const MarketsPage: MarketsProps = () => {
	const { t } = useTranslation();
	const { network } = Connector.useContainer();
	usePollAction('fetchMarkets', fetchMarkets, { dependencies: [network.id] });

	return (
		<>
			<Head>
				<title>{t('dashboard-markets.page-title')}</title>
			</Head>
			<Markets />
			<GitHashID />
		</>
	);
};

MarketsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default MarketsPage;
