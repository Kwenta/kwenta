import { Provider, Contract as EthCallContract } from 'ethcall';
import { useQuery, UseQueryOptions } from 'react-query';
import { wei } from '@synthetixio/wei';
import keyBy from 'lodash/keyBy';
import erc20Abi from 'lib/abis/ERC20.json';
import { BigNumber } from 'ethers';
import { TokenBalances } from '@synthetixio/queries';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import Connector from 'containers/Connector';
import { Token } from 'queries/tokenLists/types';
import QUERY_KEYS from 'constants/queryKeys';

const FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a'];

const useTokensBalancesQuery = (
	tokens: Token[],
	walletAddress: string | null,
	options?: UseQueryOptions<TokenBalances | null>
) => {
	const { provider, network } = Connector.useContainer();

	const filteredTokens = tokens.filter((t) => !FILTERED_TOKENS.includes(t.address.toLowerCase()));
	const symbols = filteredTokens.map((token) => token.symbol);
	const tokensMap = keyBy(filteredTokens, 'symbol');

	return useQuery<TokenBalances | null>(
		QUERY_KEYS.WalletBalances.Tokens(
			walletAddress,
			network!.id,
			filteredTokens.map((f) => f.address).join()
		),
		async () => {
			if (!provider) return null;
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);

			const calls = [];
			for (const { address, symbol } of filteredTokens) {
				if (symbol === CRYPTO_CURRENCY_MAP.ETH) {
					calls.push(ethcallProvider.getEthBalance(walletAddress!));
				} else {
					const tokenContract = new EthCallContract(address, erc20Abi);
					calls.push(tokenContract.balanceOf(walletAddress));
				}
			}

			const data = (await ethcallProvider.all(calls)) as BigNumber[];

			const tokenBalances: TokenBalances = {};
			data.forEach((value, index) => {
				if (value.lte(0)) return;
				const token = tokensMap[symbols[index]];

				tokenBalances[symbols[index]] = {
					balance: wei(value, token.decimals ?? 18),
					token,
				};
			});
			return tokenBalances;
		},
		{
			enabled: !!provider && tokens.length > 0 && !!walletAddress,
			...options,
		}
	);
};

export default useTokensBalancesQuery;
