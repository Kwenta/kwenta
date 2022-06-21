import { Provider, Contract as EthCallContract } from 'ethcall';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { wei } from '@synthetixio/wei';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';
import zipObject from 'lodash/zipObject';
import mapValues from 'lodash/mapValues';
import erc20Abi from 'lib/abis/ERC20.json';
import { Contract, BigNumber } from 'ethers';
import { TokenBalances } from '@synthetixio/queries';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import Connector from 'containers/Connector';
import { Token } from 'queries/tokenLists/types';

const FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a'];

type UseTokensBalancesQueryReturn = UseQueryResult<TokenBalances>;
const useTokensBalancesQuery = (
	tokens: Token[],
	walletAddress: string | null,
	options?: UseQueryOptions<TokenBalances>
): UseTokensBalancesQueryReturn => {
	const { provider, network } = Connector.useContainer();

	const filteredTokens = tokens.filter((t) => !FILTERED_TOKENS.includes(t.address.toLowerCase()));
	const symbols = filteredTokens.map((token) => token.symbol);
	const tokensMap = keyBy(filteredTokens, 'symbol');

	return useQuery<TokenBalances>(
		[
			'walletBalances',
			'tokens',
			network!.id,
			walletAddress,
			filteredTokens.map((f) => f.address).join(),
		],
		async () => {
			if (!provider) return {};
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider as any);

			const calls = [];
			for (const { address, symbol } of filteredTokens) {
				if (symbol === CRYPTO_CURRENCY_MAP.ETH) {
					network.id === 1
						? calls.push(ethcallProvider.getEthBalance(walletAddress!))
						: calls.push(provider?.getBalance(walletAddress!));
				} else {
					if (network.id === 1) {
						const tokenContract = new EthCallContract(address, erc20Abi);
						calls.push(tokenContract.balanceOf(walletAddress));
					} else {
						const tokenContract = new Contract(address, erc20Abi, provider || undefined);
						calls.push(tokenContract.balanceOf(walletAddress));
					}
				}
			}

			// ethcall doesn't seem to work with Optimism currently

			const data =
				network.id === 1
					? ((await ethcallProvider.all(calls, {})) as BigNumber[])
					: await Promise.all(calls);

			const balancesMap = zipObject(symbols, data);
			const positiveBalances = omitBy(balancesMap, (entry) => entry.lte(0));

			return mapValues(positiveBalances, (balance, symbol: string) => {
				const token = tokensMap[symbol];

				return {
					balance: wei(balance, token.decimals ?? 18),
					token,
				};
			});
		},
		{
			enabled: !!provider && tokens.length > 0 && !!walletAddress,
			...options,
		}
	);
};

export default useTokensBalancesQuery;
