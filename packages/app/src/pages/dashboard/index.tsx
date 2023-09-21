import Head from 'next/head'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardLayout from 'sections/dashboard/DashboardLayout'
import Overview from 'sections/dashboard/Overview'
import { useFetchStakeMigrateData, usePollDashboardFuturesData } from 'state/futures/hooks'

type DashboardComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const Dashboard: DashboardComponent = () => {
	const { t } = useTranslation()

	usePollDashboardFuturesData()
	useFetchStakeMigrateData()

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Overview />
		</>
	)
}

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Dashboard
