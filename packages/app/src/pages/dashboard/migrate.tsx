import Head from 'next/head'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardLayout from 'sections/dashboard/DashboardLayout'
import MigrationSteps from 'sections/dashboard/Stake/MigrationSteps'
import { useFetchStakeMigrateData } from 'state/futures/hooks'

type MigrateComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const MigratePage: MigrateComponent = () => {
	const { t } = useTranslation()

	useFetchStakeMigrateData()

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<MigrationSteps />
		</>
	)
}

MigratePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default MigratePage
