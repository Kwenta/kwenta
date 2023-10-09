import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { TabPanel } from 'components/Tab'
import TraderHistory from 'sections/futures/TraderHistory'
import Trades from 'sections/futures/Trades'
import { fetchPositionHistoryForTrader } from 'state/futures/actions'
import { selectPositionsHistoryTableData } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectWallet } from 'state/wallet/selectors'

export enum HistoryTab {
	Positions = 'positions',
	Trades = 'trades',
}

type HistoryTabsProp = {
	currentTab: HistoryTab
	onChangeTab(tab: HistoryTab): () => void
}

const HistoryTabs: React.FC<HistoryTabsProp> = ({ currentTab, onChangeTab }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const walletAddress = useAppSelector(selectWallet)
	const positionHistory = useAppSelector(selectPositionsHistoryTableData)

	useEffect(() => {
		dispatch(fetchPositionHistoryForTrader(walletAddress ?? ''))
	}, [dispatch, walletAddress])

	return (
		<>
			<TabButtons>
				<TabButton
					variant="noOutline"
					title={t('dashboard.history.tabs.positions')}
					onClick={onChangeTab(HistoryTab.Positions)}
					active={currentTab === HistoryTab.Positions}
				/>
				<TabButton
					variant="noOutline"
					title={t('dashboard.history.tabs.trades')}
					onClick={onChangeTab(HistoryTab.Trades)}
					active={currentTab === HistoryTab.Trades}
				/>
			</TabButtons>
			<div>
				<TabPanel name={HistoryTab.Positions} activeTab={currentTab}>
					<TraderHistory
						trader={walletAddress ?? ''}
						positionHistory={positionHistory}
						resetSelection={() => {}}
						compact={true}
					/>
				</TabPanel>
				<TabPanel name={HistoryTab.Trades} activeTab={currentTab}>
					<Trades rounded={true} noBottom={false} />
				</TabPanel>
			</div>
		</>
	)
}

const TabButtons = styled.div`
	display: flex;
	gap: 25px;
	margin-bottom: 25px;
`

export default HistoryTabs
