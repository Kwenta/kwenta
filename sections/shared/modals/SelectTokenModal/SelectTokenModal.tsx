import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import { useRecoilValue } from 'recoil';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import useZapperTokenList from 'queries/tokenLists/useZapperTokenList';
import useCoinGeckoTokenPricesQuery from 'queries/coingecko/useCoinGeckoTokenPricesQuery';
import useCoinGeckoPricesQuery from 'queries/coingecko/useCoinGeckoPricesQuery';
import { CoinGeckoPriceIds } from 'queries/coingecko/types';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Button from 'components/Button';
import Loader from 'components/Loader';
import SearchInput from 'components/Input/SearchInput';

import useDebouncedMemo from 'hooks/useDebouncedMemo';

import { FlexDivCentered, BottomShadow, FlexDivColCentered } from 'styles/common';

import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';

import Connector from 'containers/Connector';

import { RowsHeader, RowsContainer, CenteredModal } from '../common';

import TokenRow from './TokenRow';
import useSynthetixQueries from '@synthetixio/queries';

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
	const { connectWallet, provider, network } = Connector.useContainer();
	const { useTokensBalancesQuery } = useSynthetixQueries({ networkId: network?.id ?? null, provider });
	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const tokenListQuery = useZapperTokenList();
	const tokenList = useMemo(
		() => (tokenListQuery.isSuccess ? tokenListQuery.data?.tokens ?? [] : []),
		[tokenListQuery.isSuccess, tokenListQuery.data]
	);

	const tokensWalletBalancesQuery = useTokensBalancesQuery(tokenList, walletAddress);
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
				? Object.values(
						mapValues(tokenBalances, ({ balance, token }, symbol) => {
							const { address } = token;

							const price =
								symbol === CRYPTO_CURRENCY_MAP.ETH
									? get(coinGeckoPrices, [CoinGeckoPriceIds.ETH, 'usd'], null)
									: get(coinGeckoTokenPrices, [address.toLowerCase(), 'usd'], null);

							return {
								currencyKey: symbol,
								balance,
								usdBalance: price != null ? balance.multipliedBy(price) : null,
								token,
							};
						})
				  )
				: [],
		[coinGeckoPrices, coinGeckoTokenPrices, tokenBalances]
	);

	const searchFilteredTokens = useDebouncedMemo(
		() =>
			assetSearch
				? tokenBalancesWithPrices.filter(({ token: { name, symbol, address } }) => {
						const assetSearchQueryLC = assetSearch.toLowerCase();

						return (
							name.toLowerCase().includes(assetSearchQueryLC) ||
							symbol.toLowerCase().includes(assetSearchQueryLC) ||
							address.toLowerCase() === assetSearchQueryLC
						);
				  })
				: tokenBalancesWithPrices,
		[tokenBalancesWithPrices, assetSearch],
		DEFAULT_SEARCH_DEBOUNCE_MS
	);

	const tokensResults = useMemo(() => {
		const tokens = orderBy(
			assetSearch ? searchFilteredTokens : tokenBalancesWithPrices,
			(token) =>
				token.usdBalance != null ? token.usdBalance.toNumber() : token.balance.toNumber(),
			'desc'
		);

		return tokensToOmit?.length
			? tokens.filter(({ currencyKey }) => !tokensToOmit.includes(currencyKey))
			: tokens;
	}, [assetSearch, searchFilteredTokens, tokenBalancesWithPrices, tokensToOmit]);

	return (
		<StyledCenteredModal onDismiss={onDismiss} isOpen={true} title={t('modals.select-token.title')}>
			<SearchContainer>
				<AssetSearchInput
					placeholder={t('modals.select-token.search.placeholder')}
					onChange={(e) => {
						setAssetSearch(e.target.value);
					}}
					value={assetSearch}
					autoFocus={isWalletConnected}
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
					tokensResults.map((tokenResult) => {
						const { currencyKey, token, balance, usdBalance } = tokenResult;

						return (
							<TokenRow
								key={currencyKey}
								onClick={() => {
									onSelect(currencyKey);
									onDismiss();
								}}
								totalValue={usdBalance ?? undefined}
								{...{ balance, token, selectedPriceCurrency, selectPriceCurrencyRate }}
							/>
						);
					})
				) : !isWalletConnected ? (
					<ContainerEmptyState>
						<Message>{t('exchange.connect-wallet-card.message')}</Message>
						<MessageButton
							onClick={() => {
								onDismiss();
								connectWallet();
							}}
						>
							{t('common.wallet.connect-wallet')}
						</MessageButton>
					</ContainerEmptyState>
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

const ContainerEmptyState = styled(FlexDivColCentered)`
	margin: 8px 0px;
	padding: 0 30px;
	button {
		width: 200px;
	}
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 24px 32px;
	text-align: center;
`;

const MessageButton = styled(Button).attrs({ variant: 'primary', size: 'lg', isRounded: true })`
	width: 200px;
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
