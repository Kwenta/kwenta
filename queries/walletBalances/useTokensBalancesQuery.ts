import { Provider, Contract } from 'ethcall';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { wei } from '@synthetixio/wei';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';
import zipObject from 'lodash/zipObject';
import mapValues from 'lodash/mapValues';
import erc20Abi from 'lib/abis/ERC20.json';
import { ethers } from 'ethers';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { Token, TokenBalances } from '@synthetixio/queries';
import Connector from 'containers/Connector';

const ethcallProvider = new Provider();

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
		['walletBalances', 'tokens', network!.id, walletAddress, filteredTokens.join()],
		async () => {
			await ethcallProvider.init(provider as any);

			const calls = [];
			for (const { address, symbol } of filteredTokens) {
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
