import Head from 'next/head'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import Spacer from 'components/Spacer'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import TradesTab from 'sections/futures/MobileTrade/UserTabs/TradesTab'
import Trades from 'sections/futures/Trades'
import { usePollDashboardFuturesData } from 'state/futures/hooks'

type HistoryPageProps = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const HistoryPage: HistoryPageProps = () => {
	const { t } = useTranslation()
	usePollDashboardFuturesData()
	return (
		<>
			<Head>
				<title>{t('dashboard-history.page-title')}</title>
			</Head>
			<MobileHiddenView>
				<Spacer height={15} />
				<Trades rounded={true} noBottom={false} />
				<Spacer height={50} />
			</MobileHiddenView>
			<MobileOnlyView>
				<TradesTab />
			</MobileOnlyView>
		</>
	)
}

HistoryPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default HistoryPage
