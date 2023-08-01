import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { TabPanel } from 'components/Tab'
import Trades from 'sections/futures/Trades'
import TraderHistory from 'sections/leaderboard/TraderHistory'
import { fetchPositionHistoryForTrader } from 'state/futures/actions'
import { setSelectedTrader } from 'state/futures/reducer'
import { selectPositionHistoryForSelectedTrader } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectWallet } from 'state/wallet/selectors'
import media from 'styles/media'

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
	const positionHistory = useAppSelector(selectPositionHistoryForSelectedTrader)

	useEffect(() => {
		dispatch(
			setSelectedTrader({
				trader: walletAddress ?? '',
			})
		)
		dispatch(fetchPositionHistoryForTrader(walletAddress ?? ''))
	}, [dispatch, walletAddress])

	return (
		<HistoryTabsContainer>
			<HistoryTabsHeader>
				<TabButtons>
					<TabButton
						nofill={true}
						isRounded={true}
						title={t('dashboard.history.tabs.positions')}
						onClick={onChangeTab(HistoryTab.Positions)}
						active={currentTab === HistoryTab.Positions}
					/>
					<TabButton
						nofill={true}
						isRounded={true}
						title={t('dashboard.history.tabs.trades')}
						onClick={onChangeTab(HistoryTab.Trades)}
						active={currentTab === HistoryTab.Trades}
					/>
				</TabButtons>
			</HistoryTabsHeader>
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
		</HistoryTabsContainer>
	)
}

const HistoryTabsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 15px;

	${media.lessThan('md')`
		flex-direction: column;
		row-gap: 10px;
		margin-bottom: 25px;
		margin-top: 0px;
	`}
`

const HistoryTabsContainer = styled.div`
	${media.lessThan('md')`
		padding: 15px;
	`}
`

const TabButtons = styled.div`
	display: flex;

	& > button:not(:last-of-type) {
		margin-right: 15px;
	}

	${media.lessThan('md')`
		justify-content: flex-start;
	`}
`

export default HistoryTabs
