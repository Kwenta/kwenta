import { ComponentType, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import useTokensBalancesQuery from 'queries/walletBalances/useTokensBalancesQuery';
import use1InchTokenList from 'queries/tokenLists/use1InchTokenList';
import useCoinGeckoTokenPricesQuery from 'queries/coingecko/useCoinGeckoTokenPricesQuery';
import useCoinGeckoPricesQuery from 'queries/coingecko/useCoinGeckoPricesQuery';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Loader from 'components/Loader';
import SearchInput from 'components/Input/SearchInput';

import useDebouncedMemo from 'hooks/useDebouncedMemo';

import { FlexDivCentered, BottomShadow } from 'styles/common';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';

import { RowsHeader, RowsContainer, CenteredModal } from '../common';

import TokenRow from './TokenRow';
import { CoinGeckoPriceIds } from 'queries/coingecko/types';

type SelectTokenModalProps = {
	onDismiss: () => void;
	onSelect: (currencyKey: CurrencyKey) => void;
	tokensToOmit?: CurrencyKey[];
};

export const SelectTokenModal: FC<SelectTokenModalProps> = ({
	onDismiss,
	onSelect,
	tokensToOmit,
}) => {
	const { t } = useTranslation();
	const [assetSearch, setAssetSearch] = useState<string>('');
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const tokenListQuery = use1InchTokenList();
	const tokenList = useMemo(
		() => (tokenListQuery.isSuccess ? tokenListQuery.data?.tokens ?? [] : []),
		[tokenListQuery.isSuccess, tokenListQuery.data]
	);

	const tokensWalletBalancesQuery = useTokensBalancesQuery(tokenList);
	const tokenBalances = tokensWalletBalancesQuery.isSuccess
		? tokensWalletBalancesQuery.data ?? null
		: null;

	const isLoading = tokenListQuery.isLoading || tokensWalletBalancesQuery.isLoading;

	const tokenBalancesAddresses = useMemo(
		() =>
			tokenBalances != null
				? Object.values(tokenBalances).map((tokenBalance) => tokenBalance.token.address)
				: [],
		[tokenBalances]
	);

	const coinGeckoTokenPricesQuery = useCoinGeckoTokenPricesQuery(tokenBalancesAddresses);
	const coinGeckoTokenPrices = coinGeckoTokenPricesQuery.isSuccess
		? coinGeckoTokenPricesQuery.data ?? null
		: null;

	const coinGeckoPricesQuery = useCoinGeckoPricesQuery([CoinGeckoPriceIds.ETH]);
	const coinGeckoPrices = coinGeckoPricesQuery.isSuccess ? coinGeckoPricesQuery.data ?? null : null;

	const tokenBalancesWithPrices = useMemo(
		() =>
			tokenBalances != null
				? mapValues(tokenBalances, ({ balance, token: { address } }, symbol) => {
						const price =
							symbol === CRYPTO_CURRENCY_MAP.ETH
								? get(coinGeckoPrices, [CoinGeckoPriceIds.ETH, 'usd'], null)
								: get(coinGeckoTokenPrices, [address.toLowerCase(), 'usd'], null);

						return {
							currencyKey: symbol,
							balance,
							usdBalance: price != null ? balance.multipliedBy(price) : null,
						};
				  })
				: tokenBalances,
		[coinGeckoPrices, coinGeckoTokenPrices, tokenBalances]
	);

	const searchFilteredTokens = useDebouncedMemo(
		() =>
			assetSearch
				? tokenList.filter(({ name, symbol, address }) => {
						const assetSearchQueryLC = assetSearch.toLowerCase();

						return (
							name.toLowerCase().includes(assetSearchQueryLC) ||
							symbol.toLowerCase().includes(assetSearchQueryLC) ||
							address.toLowerCase() === assetSearchQueryLC
						);
				  })
				: tokenList,
		[tokenList, assetSearch],
		DEFAULT_SEARCH_DEBOUNCE_MS
	);

	const tokensResults = useMemo(() => {
		let tokens = assetSearch ? searchFilteredTokens : tokenList;
		if (tokensWalletBalancesQuery.isSuccess && tokenBalancesWithPrices != null) {
			tokens = orderBy(
				tokens,
				(token) => {
					const tokenBalance = tokenBalancesWithPrices[token.symbol];
					if (tokenBalance != null) {
						return tokenBalance.usdBalance != null
							? tokenBalance.usdBalance.toNumber()
							: tokenBalance.balance.toNumber();
					}
					return 0;
				},
				'desc'
			);
		}
		return tokensToOmit?.length
			? tokens.filter((token) => !tokensToOmit.includes(token.symbol))
			: tokens;
	}, [
		assetSearch,
		searchFilteredTokens,
		tokensWalletBalancesQuery.isSuccess,
		tokenBalancesWithPrices,
		tokenList,
		tokensToOmit,
	]);
	const renderRow: ComponentType<ListChildComponentProps> = ({ index, style }) => {
		const token = tokensResults[index];
		const currencyKey = token.symbol;
		const tokenBalance =
			tokenBalancesWithPrices != null ? tokenBalancesWithPrices[token.symbol] : null;

		return (
			<div key={currencyKey} style={style}>
				<TokenRow
					key={currencyKey}
					onClick={() => {
						onSelect(currencyKey);
						onDismiss();
					}}
					balance={tokenBalance != null ? tokenBalance.balance : undefined}
					totalValue={
						tokenBalance != null && tokenBalance.usdBalance != null
							? tokenBalance.usdBalance
							: undefined
					}
					token={token}
					selectPriceCurrencyRate={selectPriceCurrencyRate}
					selectedPriceCurrency={selectedPriceCurrency}
				/>
			</div>
		);
	};

	return (
		<StyledCenteredModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-token.title')}>
			<SearchContainer>
				<AssetSearchInput
					placeholder={t('modals.select-token.search.placeholder')}
					onChange={(e) => {
						setAssetSearch(e.target.value);
					}}
					value={assetSearch}
					autoFocus={true}
				/>
			</SearchContainer>
			<RowsHeader>
				<span>
					{assetSearch ? (
						<span>{t('modals.select-token.header.search-results')}</span>
					) : (
						t('modals.select-token.header.all-tokens')
					)}
				</span>
				<span>{t('modals.select-token.header.holdings')}</span>
			</RowsHeader>
			<StyledRowsContainer>
				{isLoading ? (
					<Loader />
				) : tokensResults.length > 0 ? (
					<AutoSizer>
						{({ height, width }) => (
							<FixedSizeList
								height={height}
								itemCount={tokensResults.length}
								itemSize={48}
								width={width}
							>
								{renderRow}
							</FixedSizeList>
						)}
					</AutoSizer>
				) : (
					<EmptyDisplay>{t('modals.select-token.search.empty-results')}</EmptyDisplay>
				)}
			</StyledRowsContainer>
			<StyledBottomShadow />
		</StyledCenteredModal>
	);
};

const StyledCenteredModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		height: 80vh;
		padding: 16px 0;
		overflow: hidden;
	}
`;

const SearchContainer = styled.div`
	margin: 0 16px 12px 16px;
`;

const AssetSearchInput = styled(SearchInput)`
	font-size: 16px;
	height: 40px;
	font-family: ${(props) => props.theme.fonts.bold};
	::placeholder {
		text-transform: capitalize;
		color: ${(props) => props.theme.colors.silver};
	}
`;

const EmptyDisplay = styled(FlexDivCentered)`
	justify-content: center;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-align: center;
	margin: 24px 0px;
	height: 50px;
	color: ${(props) => props.theme.colors.white};
`;

const StyledBottomShadow = styled(BottomShadow)`
	position: absolute;
	height: 32px;
`;

const StyledRowsContainer = styled(RowsContainer)`
	height: 100%;
`;

export default SelectTokenModal;
