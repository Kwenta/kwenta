import { Provider, Contract } from 'ethcall';
import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';
import erc20Abi from 'lib/abis/ERC20.json';
import zipObject from 'lodash/zipObject';
import omitBy from 'lodash/omitBy';
import mapValues from 'lodash/mapValues';
import keyBy from 'lodash/keyBy';
import { ethers } from 'ethers';

import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { CRYPTO_CURRENCY_MAP, CurrencyKey } from 'constants/currency';

import { Token } from 'queries/tokenLists/types';

import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import { appReadyState } from 'store/app';

import { toBigNumber } from 'utils/formatters/number';

export type Balances = Record<
	CurrencyKey,
	{
		balance: BigNumber;
		token: Token;
	}
>;

const ethcallProvider = new Provider();

const useTokensBalancesQuery = (tokens: Token[], options?: QueryConfig<Balances>) => {
	const { provider } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	const symbols = tokens.map((token) => token.symbol);
	const tokensMap = keyBy(tokens, 'symbol');

	return useQuery<Balances>(
		QUERY_KEYS.WalletBalances.Tokens(walletAddress ?? '', network?.id!),
		async () => {
			// @ts-ignore
			await ethcallProvider.init(provider!);

			const calls = [];
			for (const { address, symbol } of tokens) {
				if (symbol === CRYPTO_CURRENCY_MAP.ETH) {
					calls.push(ethcallProvider.getEthBalance(walletAddress!));
				} else {
					const tokenContract = new Contract(address, erc20Abi);
					calls.push(tokenContract.balanceOf(walletAddress));
				}
			}

			const data = (await ethcallProvider.all(calls, {})) as ethers.BigNumber[];

			const balancesMap = zipObject(symbols, data);

			const positiveBalances = omitBy(balancesMap, (entry) => entry.lte(0));

			return mapValues(positiveBalances, (balance, symbol) => {
				const token = tokensMap[symbol];

				return {
					balance: toBigNumber(balance.toString()).div(toBigNumber(10).pow(token.decimals)),
					token,
				};
			});
		},
		{
			enabled: isAppReady && isWalletConnected && provider != null && tokens.length > 0,
			...options,
		}
	);
};

export default useTokensBalancesQuery;
