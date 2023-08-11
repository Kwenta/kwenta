import { ETH_ADDRESS, ETH_COINGECKO_ADDRESS, ZERO_WEI } from '@kwenta/sdk/constants'
import { getSynthsListForNetwork, SynthSymbol } from '@kwenta/sdk/data'
import { NetworkId } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'
import orderBy from 'lodash/orderBy'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'

import Input from 'components/Input/Input'
import { FlexDivCentered } from 'components/layout/flex'
import { RowsHeader, CenteredModal } from 'components/layout/modals'
import Loader from 'components/Loader'
import { CurrencyKey, CATEGORY_MAP } from 'constants/currency'
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults'
import useDebouncedMemo from 'hooks/useDebouncedMemo'
import useCoinGeckoTokenPricesQuery from 'queries/coingecko/useCoinGeckoTokenPricesQuery'
import {
	selectBalances,
	selectBalancesFetchStatus,
	selectSynthBalancesLoading,
} from 'state/balances/selectors'
import { selectTokenList } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { selectNetwork } from 'state/wallet/selectors'

import CurrencyRow from './CurrencyRow'

const PAGE_LENGTH = 50

export const CATEGORY_FILTERS = [CATEGORY_MAP.crypto, CATEGORY_MAP.forex, CATEGORY_MAP.commodity]

type SelectCurrencyModalProps = {
	synthsOverride?: Array<CurrencyKey>
	onDismiss: () => void
	onSelect: (currencyKey: string, isSynth: boolean) => void
}

export const SelectCurrencyModal: FC<SelectCurrencyModalProps> = ({
	synthsOverride,
	onDismiss,
	onSelect,
}) => {
	const { t } = useTranslation()
	const network = useAppSelector(selectNetwork)

	const [assetSearch, setAssetSearch] = useState('')
	const [page, setPage] = useState(1)

	// Disable 1inch for now
	const oneInchEnabled = false

	const allSynths = useMemo(() => getSynthsListForNetwork(network as NetworkId), [network])

	const synths = !!synthsOverride
		? allSynths.filter((synth) => synthsOverride.includes(synth.name))
		: allSynths

	const { synthBalancesMap, tokenBalances } = useAppSelector(selectBalances)
	const tokenList = useAppSelector(selectTokenList)
	const balancesStatus = useAppSelector(selectBalancesFetchStatus)
	const synthBalancesLoading = useAppSelector(selectSynthBalancesLoading)

	const searchFilteredSynths = useDebouncedMemo(
		() =>
			assetSearch
				? synths.filter(({ name, description }) => {
						const assetSearchLC = assetSearch.toLowerCase()

						return (
							name.toLowerCase().includes(assetSearchLC) ||
							description.toLowerCase().includes(assetSearchLC)
						)
				  })
				: synths,
		[synths, assetSearch],
		DEFAULT_SEARCH_DEBOUNCE_MS
	)

	const synthsResults = useMemo(() => {
		const synthsList = assetSearch ? searchFilteredSynths : synths
		return orderBy(
			synthsList,
			[
				(synth) => {
					const synthBalance = synthBalancesMap[synth.name]
					return !!synthBalance ? Number(synthBalance.usdBalance) : 0
				},
				(synth) => synth.name.toLowerCase(),
			],
			['desc', 'asc']
		)
	}, [assetSearch, searchFilteredSynths, synths, synthBalancesMap])

	const synthKeys = useMemo(() => synthsResults.map((s) => s.name), [synthsResults])

	const combinedTokenList = useMemo(() => {
		const withSynthTokensCombined = [
			...tokenList.filter((i) => !synthKeys.includes(i.symbol as SynthSymbol)),
			...synthsResults.map((synthToken) => ({ symbol: synthToken?.name, ...synthToken })),
		]
		return withSynthTokensCombined
	}, [synthKeys, synthsResults, tokenList])

	const searchFilteredTokens = useDebouncedMemo(
		() =>
			assetSearch
				? combinedTokenList
						.filter(({ name, symbol }) => {
							const assetSearchLC = assetSearch.toLowerCase()
							return (
								name.toLowerCase().includes(assetSearchLC) ||
								symbol.toLowerCase().includes(assetSearchLC)
							)
						})
						.map((t: any) => ({ ...t, isSynth: false }))
				: combinedTokenList,
		[combinedTokenList, assetSearch],
		DEFAULT_SEARCH_DEBOUNCE_MS
	)

	const coinGeckoTokenPricesQuery = useCoinGeckoTokenPricesQuery(
		searchFilteredTokens.map((f) => f.address)
	)
	const coinGeckoPrices = coinGeckoTokenPricesQuery.data ?? null

	const oneInchTokensPaged = useMemo(() => {
		const ordered =
			balancesStatus === FetchStatus.Success
				? orderBy(
						searchFilteredTokens.map((token) => {
							const tokenAddress =
								token.address === ETH_ADDRESS ? ETH_COINGECKO_ADDRESS : token.address
							if (coinGeckoPrices?.[tokenAddress] && tokenBalances !== null) {
								const price = wei(coinGeckoPrices[tokenAddress].usd ?? 0)
								const balance = tokenBalances[token.symbol]?.balance ?? ZERO_WEI
								const usdBalance = price.mul(balance)

								return { ...token, usdBalance, balance }
							}
							return token
						}),
						[({ usdBalance }) => usdBalance?.toNumber() ?? 0, ({ symbol }) => symbol.toLowerCase()],
						['desc', 'asc']
				  )
				: searchFilteredTokens
		if (ordered.length > PAGE_LENGTH) return ordered.slice(0, PAGE_LENGTH * page)
		return ordered
	}, [balancesStatus, searchFilteredTokens, page, coinGeckoPrices, tokenBalances])

	return (
		<StyledCenteredModal onDismiss={onDismiss} isOpen title={t('modals.select-currency.title')}>
			<Container id="scrollableDiv">
				<SearchContainer>
					<AssetSearchInput
						placeholder={t('modals.select-currency.search.placeholder')}
						onChange={(e) => {
							setAssetSearch(e.target.value)
						}}
						value={assetSearch}
						autoFocus
					/>
				</SearchContainer>
				<InfiniteScroll
					dataLength={searchFilteredTokens.length}
					next={() => {
						setTimeout(() => {
							setPage(page + 1)
						}, 200)
					}}
					hasMore={oneInchEnabled && oneInchTokensPaged.length !== searchFilteredTokens.length}
					loader={
						<LoadingMore>
							<Loader inline />
						</LoadingMore>
					}
					scrollableTarget="scrollableDiv"
				>
					<TokensHeader>
						<span>{t('modals.select-currency.header.tokens')}</span>
						<span>{t('modals.select-currency.header.holdings')}</span>
					</TokensHeader>
					{!oneInchEnabled ? (
						<>
							{synthBalancesLoading ? (
								<Loader />
							) : synthsResults.length > 0 ? (
								// TODO: use `Synth` type from contracts-interface
								synthsResults.map((synth) => {
									const currencyKey = synth.name
									return (
										<CurrencyRow
											key={currencyKey}
											onClick={() => {
												onSelect(currencyKey, false)
												onDismiss()
											}}
											balance={synthBalancesMap[currencyKey]}
											token={{ name: synth.description, symbol: synth.name, isSynth: true }}
										/>
									)
								})
							) : (
								<EmptyDisplay>{t('modals.select-currency.search.empty-results')}</EmptyDisplay>
							)}
						</>
					) : oneInchTokensPaged.length > 0 ? (
						oneInchTokensPaged.map((token) => {
							const { symbol: currencyKey, balance, usdBalance } = token
							return (
								<CurrencyRow
									key={currencyKey}
									onClick={() => {
										onSelect(currencyKey, true)
										onDismiss()
									}}
									balance={balance && usdBalance ? { currencyKey, balance, usdBalance } : undefined}
									token={{ ...token, isSynth: false }}
								/>
							)
						})
					) : (
						<EmptyDisplay>{t('modals.select-currency.search.empty-results')}</EmptyDisplay>
					)}
				</InfiniteScroll>
			</Container>
		</StyledCenteredModal>
	)
}

const Container = styled.div`
	height: 100%;
	overflow-y: scroll;
`

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		height: 80vh;
		padding: 0px;
		overflow-y: scroll;
	}
`

const SearchContainer = styled.div`
	margin: 0 16px 12px 16px;
`

const AssetSearchInput = styled(Input).attrs({ type: 'search' })`
	font-size: 16px;
	height: 40px;
	::placeholder {
		text-transform: capitalize;
		color: ${(props) => props.theme.colors.selectedTheme.button.secondary};
	}
`

const EmptyDisplay = styled(FlexDivCentered)`
	justify-content: center;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: center;
	margin: 24px 0px;
	height: 50px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

const LoadingMore = styled.div`
	text-align: center;
`

const TokensHeader = styled(RowsHeader)`
	margin-top: 10px;
`

export default SelectCurrencyModal
