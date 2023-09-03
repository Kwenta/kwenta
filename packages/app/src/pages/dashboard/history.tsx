import Head from 'next/head'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import UploadIcon from 'assets/svg/futures/upload-icon.svg'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import Pill from 'components/Pill'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import HistoryTabs, { HistoryTab } from 'sections/dashboard/HistoryTabs'
import TradesTab from 'sections/futures/MobileTrade/UserTabs/TradesTab'
import { usePollDashboardFuturesData } from 'state/futures/hooks'
import { selectCsvExport } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

type HistoryPageProps = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const HistoryPage: HistoryPageProps = () => {
	const { t } = useTranslation()

	usePollDashboardFuturesData()

	const [currentTab, setCurrentTab] = useState(HistoryTab.Positions)

	const handleChangeTab = useCallback(
		(tab: HistoryTab) => () => {
			setCurrentTab(tab)
		},
		[]
	)

	const csvData = useAppSelector(selectCsvExport)
	const file = useMemo(() => `data:text/csv;base64,${btoa(csvData)}`, [csvData])
	const fileName = useMemo(
		() => (currentTab === HistoryTab.Positions ? 'positions-history.csv' : 'trades-history.csv'),
		[currentTab]
	)

	return (
		<>
			<Head>
				<title>{t('dashboard-history.page-title')}</title>
			</Head>
			<MobileHiddenView>
				<FlexDivRowCentered>
					<FlexDivCol>
						<Heading variant="h3">{t('dashboard-history.main-title')}</Heading>
						<Body color={'secondary'}>{t('dashboard-history.subtitle')}</Body>
					</FlexDivCol>
					<a href={file} download={fileName}>
						<Pill size="large">
							<FlexDivRowCentered columnGap="8px">
								<span>{t('dashboard-history.export-btn')}</span>
								<UploadIcon width={8} style={{ 'margin-bottom': '2px' }} />
							</FlexDivRowCentered>
						</Pill>
					</a>
				</FlexDivRowCentered>
				<Spacer height={30} />
				<HistoryTabs onChangeTab={handleChangeTab} currentTab={currentTab} />
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
