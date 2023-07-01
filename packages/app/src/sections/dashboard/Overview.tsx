import { ETH_ADDRESS, ETH_COINGECKO_ADDRESS, ZERO_WEI } from '@kwenta/sdk/constants'
import { SynthSymbol } from '@kwenta/sdk/data'
import { formatDollars, toWei } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ExchangeTokens } from 'types/synths'

import TabButton from 'components/Button/TabButton'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import FuturesIcon from 'components/Nav/FuturesIcon'
import { TabPanel } from 'components/Tab'
import Search from 'components/Table/Search'
import * as Text from 'components/Text'
import Connector from 'containers/Connector'
import { FuturesAccountTypes } from 'queries/futures/types'
import { selectBalances } from 'state/balances/selectors'
import { sdk } from 'state/config'
import { fetchTokenList } from 'state/exchange/actions'
import { setFuturesAccountType } from 'state/futures/reducer'
import {
	selectActiveSmartPositionsCount,
	selectFuturesPortfolio,
	selectFuturesType,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector, useFetchAction } from 'state/hooks'
import { selectSynthsMap } from 'state/wallet/selectors'
import logError from 'utils/logError'

import FuturesMarketsTable from './FuturesMarketsTable'
import FuturesPositionsTable from './FuturesPositionsTable'
import MobileDashboard from './MobileDashboard'
import PortfolioChart from './PortfolioChart'
import SynthBalancesTable from './SynthBalancesTable'

export enum PositionsTab {
	SMART_MARGIN = 'smart margin',
	ISOLATED_MARGIN = 'isolated margin',
	SPOT = 'spot',
}

// TODO: Extract initExchangeTokens to SDK/Redux

const Overview: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const accountType = useAppSelector(selectFuturesType)
	const balances = useAppSelector(selectBalances)
	const portfolio = useAppSelector(selectFuturesPortfolio)
	const smartPositionsCount = useAppSelector(selectActiveSmartPositionsCount)

	const [activePositionsTab, setActivePositionsTab] = useState<PositionsTab>(
		accountType === 'isolated_margin' ? PositionsTab.ISOLATED_MARGIN : PositionsTab.SMART_MARGIN
	)

	useEffect(() => {
		accountType === 'isolated_margin'
			? setActivePositionsTab(PositionsTab.ISOLATED_MARGIN)
			: setActivePositionsTab(PositionsTab.SMART_MARGIN)
	}, [accountType, setActivePositionsTab])

	const { network } = Connector.useContainer()
	const synthsMap = useAppSelector(selectSynthsMap)

	const { tokenBalances } = useAppSelector(({ balances }) => balances)
	// Only available on Optimism mainnet
	const oneInchEnabled = network.id === 10

	const [exchangeTokens, setExchangeTokens] = useState<ExchangeTokens>([])
	const [search, setSearch] = useState('')

	useFetchAction(fetchTokenList, { dependencies: [network] })

	useEffect(() => {
		const initExchangeTokens = async () => {
			try {
				const exchangeBalances = oneInchEnabled
					? Object.values(tokenBalances)
							.filter((token) => !synthsMap[token.token.symbol as SynthSymbol])
							.map((value) => ({
								name: value.token.name,
								currencyKey: value.token.symbol,
								balance: toWei(value.balance),
								address:
									value.token.address === ETH_ADDRESS ? ETH_COINGECKO_ADDRESS : value.token.address,
							}))
					: []

				const tokenAddresses = oneInchEnabled
					? [...Object.values(tokenBalances).map((value) => value.token.address.toLowerCase())]
					: []

				const coinGeckoPrices = await sdk.exchange.batchGetCoingeckoPrices(tokenAddresses, true)

				const _exchangeTokens = exchangeBalances.map((exchangeToken) => {
					const { name, currencyKey, balance, address } = exchangeToken

					const price = coinGeckoPrices
						? toWei(coinGeckoPrices[address]?.usd?.toString())
						: ZERO_WEI
					const priceChange = coinGeckoPrices
						? toWei(coinGeckoPrices[address]?.usd_24h_change?.toString()).div(100)
						: ZERO_WEI

					const usdBalance = balance.mul(price)

					return {
						synth: currencyKey as SynthSymbol,
						description: name,
						balance,
						usdBalance,
						price,
						priceChange,
					}
				})

				setExchangeTokens(_exchangeTokens)
			} catch (e) {
				logError(e)
			}
		}

		;(async () => {
			await initExchangeTokens()
		})()
	}, [oneInchEnabled, synthsMap, tokenBalances])

	const POSITIONS_TABS = useMemo(() => {
		const exchangeTokenBalances = exchangeTokens.reduce(
			(initial: Wei, { usdBalance }: { usdBalance: Wei }) => initial.add(usdBalance),
			ZERO_WEI
		)
		return [
			{
				name: PositionsTab.SMART_MARGIN,
				label: t('dashboard.overview.positions-tabs.smart-margin'),
				badge: smartPositionsCount,
				titleIcon: <FuturesIcon type="cross_margin" />,
				active: activePositionsTab === PositionsTab.SMART_MARGIN,
				detail: formatDollars(portfolio.crossMarginFutures),
				disabled: false,
				onClick: () => {
					setActivePositionsTab(PositionsTab.SMART_MARGIN)
					dispatch(setFuturesAccountType(FuturesAccountTypes.CROSS_MARGIN))
				},
			},
			{
				name: PositionsTab.SPOT,
				label: t('dashboard.overview.positions-tabs.spot'),
				active: activePositionsTab === PositionsTab.SPOT,
				detail: formatDollars(balances.totalUSDBalance.add(exchangeTokenBalances)),
				disabled: false,
				onClick: () => setActivePositionsTab(PositionsTab.SPOT),
			},
		]
	}, [
		t,
		dispatch,
		smartPositionsCount,
		exchangeTokens,
		balances.totalUSDBalance,
		activePositionsTab,
		portfolio.crossMarginFutures,
		setActivePositionsTab,
	])

	return (
		<>
			<DesktopOnlyView>
				<PortfolioChart />

				<TabButtonsContainer>
					{POSITIONS_TABS.map(({ name, label, badge, ...rest }) => (
						<TabButton key={name} title={label} badgeCount={badge} {...rest} />
					))}
				</TabButtonsContainer>
				<TabPanel name={PositionsTab.SMART_MARGIN} activeTab={activePositionsTab}>
					<FuturesPositionsTable accountType={FuturesAccountTypes.CROSS_MARGIN} />
				</TabPanel>

				<TabPanel name={PositionsTab.SPOT} activeTab={activePositionsTab}>
					<SynthBalancesTable exchangeTokens={exchangeTokens} />
				</TabPanel>
				<SubHeading>{t('dashboard.overview.markets-tabs.futures')}</SubHeading>
				<SearchBarContainer>
					<Search autoFocus value={search} onChange={setSearch} disabled={false} />
				</SearchBarContainer>
				<FuturesMarketsTable search={search} />
			</DesktopOnlyView>
			<MobileOrTabletView>
				<MobileDashboard exchangeTokens={exchangeTokens} />
			</MobileOrTabletView>
		</>
	)
}

const SearchBarContainer = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
`

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`

const SubHeading = styled(Text.Heading).attrs({ variant: 'h4' })`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	margin-top: 20px;
	margin-bottom: 16px;
	font-variant: all-small-caps;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`

export default Overview
