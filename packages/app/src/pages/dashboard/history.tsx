import Head from 'next/head'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import UploadIcon from 'assets/svg/futures/upload-icon.svg'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import HistoryTabs, { HistoryTab } from 'sections/dashboard/HistoryTabs'
import TradesTab from 'sections/futures/MobileTrade/UserTabs/TradesTab'
import { usePollDashboardFuturesData } from 'state/futures/hooks'
import { selectPositionsCsvData, selectTradesCsvData } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

type HistoryPageProps = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const HistoryPage: HistoryPageProps = () => {
	const { t } = useTranslation()

	usePollDashboardFuturesData()
	const tradesCsvData = useAppSelector(selectTradesCsvData)
	const positionsCsvData = useAppSelector(selectPositionsCsvData)

	const [currentTab, setCurrentTab] = useState(HistoryTab.Positions)

	const handleChangeTab = useCallback(
		(tab: HistoryTab) => () => {
			setCurrentTab(tab)
		},
		[]
	)

	const file = useMemo(
		() =>
			`data:text/csv;base64,${btoa(
				currentTab === HistoryTab.Positions ? positionsCsvData : tradesCsvData
			)}`,
		[currentTab, positionsCsvData, tradesCsvData]
	)
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
				<Spacer height={15} />
				<FlexDivRowCentered>
					<FlexDivCol>
						<Heading variant="h3">{t('dashboard-history.main-title')}</Heading>
						<Body color={'secondary'}>{t('dashboard-history.subtitle')}</Body>
					</FlexDivCol>
					<ExportButton href={file} download={fileName}>
						<span>{t('dashboard-history.export-btn')}</span>
						<UploadIcon width={8} style={{ 'margin-bottom': '2px' }} />
					</ExportButton>
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

const ExportButton = styled.a`
	gap: 8px;
	height: 36px;
	display: flex;
	font-size: 12px;
	font-weight: 700;
	padding: 10px 15px;
	border-radius: 50px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.pill.gray.text};
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.pill.gray.background};

	svg {
		width: 10px;
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.newTheme.pill.gray.text};
		}
	}

	&:hover {
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.pill.gray.hover.text};
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.pill.gray.hover.background};
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.newTheme.pill.gray.hover.text};
			}
		}
	}
`

HistoryPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default HistoryPage
