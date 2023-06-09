import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Spacer from 'components/Spacer';
import Search from 'components/Table/Search';
import DashboardLayout from 'sections/dashboard/DashboardLayout';
import FuturesMarketsTable from 'sections/dashboard/FuturesMarketsTable';
import { fetchMarkets } from 'state/futures/actions';
import { useAppSelector, usePollAction } from 'state/hooks';
import { selectNetwork } from 'state/wallet/selectors';

type MarketsProps = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const MarketsPage: MarketsProps = () => {
	const { t } = useTranslation();
	const network = useAppSelector(selectNetwork);
	const [search, setSearch] = useState('');
	usePollAction('fetchMarkets', fetchMarkets, { dependencies: [network] });

	return (
		<>
			<Head>
				<title>{t('dashboard-markets.page-title')}</title>
			</Head>
			<Spacer height={15} />
			<SearchBarContainer>
				<Search autoFocus value={search} onChange={setSearch} disabled={false} />
			</SearchBarContainer>
			<FuturesMarketsTable search={search} />
		</>
	);
};

const SearchBarContainer = styled.div`
	display: flex;
`;

MarketsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default MarketsPage;
