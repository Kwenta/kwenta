import Head from 'next/head'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import DashboardLayout from 'sections/dashboard/DashboardLayout'
import RedemptionTab from 'sections/dashboard/RedemptionTab'

type RedemptionComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const RedeemPage: RedemptionComponent = () => {
	const { t } = useTranslation()

	return (
		<>
			<Head>
				<title>{t('dashboard-redeem.page-title')}</title>
			</Head>
			<RedemptionTab />
		</>
	)
}

RedeemPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default RedeemPage
