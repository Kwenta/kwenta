import { FuturesMarginType } from '@kwenta/sdk/types'
import { formatDollars } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ExchangeTokens } from 'types/synths'

import TabButton from 'components/Button/TabButton'
import { TabPanel } from 'components/Tab'
import { SectionHeader, SectionTitle } from 'sections/futures/mobile'
import { selectBalances } from 'state/balances/selectors'
import { selectFuturesPortfolio, selectActiveSmartPositionsCount } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

import FuturesPositionsTable from '../FuturesPositionsTable'
import { MarketsTab } from '../Markets'
import { PositionsTab } from '../Overview'
import SynthBalancesTable from '../SynthBalancesTable'

export type OpenPositionsProps = {
	exchangeTokens: ExchangeTokens
	exchangeTokenBalances: Wei
}

const OpenPositions: React.FC<OpenPositionsProps> = ({ exchangeTokens, exchangeTokenBalances }) => {
	const { t } = useTranslation()
	const smartPositionsCount = useAppSelector(selectActiveSmartPositionsCount)

	const portfolio = useAppSelector(selectFuturesPortfolio)
	const balances = useAppSelector(selectBalances)

	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(
		PositionsTab.SMART_MARGIN
	)

	const POSITIONS_TABS = useMemo(
		() => [
			{
				name: PositionsTab.SMART_MARGIN,
				label: t('dashboard.overview.positions-tabs.smart-margin'),
				badge: smartPositionsCount,
				active: activePositionsTab === PositionsTab.SMART_MARGIN,
				detail: formatDollars(portfolio.smartMargin),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SMART_MARGIN),
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === PositionsTab.SPOT,
				detail: formatDollars(balances.totalUSDBalance.add(exchangeTokenBalances)),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SPOT),
			},
		],
		[
			t,
			activePositionsTab,
			smartPositionsCount,
			portfolio.smartMargin,
			balances.totalUSDBalance,
			exchangeTokenBalances,
			setActivePositionsTab,
		]
	)

	return (
		<div>
			<div style={{ margin: '15px 15px 30px 15px' }}>
				<SectionHeader>
					<SectionTitle>{t('dashboard.overview.mobile.open-positions')}</SectionTitle>
				</SectionHeader>

				<TabButtonsContainer>
					{POSITIONS_TABS.map(({ name, label, badge, ...rest }) => (
						<TabButton key={name} title={label} badgeCount={badge} {...rest} />
					))}
				</TabButtonsContainer>
			</div>

			<TabPanel name={PositionsTab.SMART_MARGIN} activeTab={activePositionsTab}>
				<FuturesPositionsTable accountType={FuturesMarginType.SMART_MARGIN} />
			</TabPanel>

			<TabPanel name={MarketsTab.SPOT} activeTab={activePositionsTab}>
				<SynthBalancesTable exchangeTokens={exchangeTokens} />
			</TabPanel>
		</div>
	)
}

const TabButtonsContainer = styled.div`
	display: flex;
	margin: 16px 0;
	justify-content: flex-start;
	column-gap: 10px;
`

export default OpenPositions
