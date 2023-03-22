import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import Markets from 'sections/dashboard/Markets';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { fetchMarkets } from 'state/futures/actions';
import { useAppSelector, usePollAction } from 'state/hooks';
import { selectNetwork } from 'state/wallet/selectors';

type MarketsProps = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const MarketsPage: MarketsProps = () => {
	const { t } = useTranslation();
	const network = useAppSelector(selectNetwork);
	usePollAction('fetchMarkets', fetchMarkets, { dependencies: [network] });

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
