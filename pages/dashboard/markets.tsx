import Head from 'next/head';

import DashboardLayout from 'sections/dashboard/DashboardLayout';
import MarketsPage from 'sections/dashboard/Markets';

type MarketsProps = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Markets: MarketsProps = () => {
	return (
		<>
			<Head>
				<title>Markets | Kwenta</title>
			</Head>

			<MarketsPage />
		</>
	);
};

Markets.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Markets;
