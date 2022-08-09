import DashboardLayout from 'sections/dashboard/DashboardLayout';
import History from 'sections/dashboard/History';

type HistoryPageProps = React.FC & { getLayout: (page: HTMLElement) => JSX.Element };

const HistoryPage: HistoryPageProps = () => {
	return <History />;
};

HistoryPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default HistoryPage;
