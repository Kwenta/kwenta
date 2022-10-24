import { NetworkId } from '@synthetixio/contracts-interface';
import { TokenBalances } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { Provider, Contract as EthCallContract } from 'ethcall';
import { BigNumber } from 'ethers';
import keyBy from 'lodash/keyBy';
import { useQuery, UseQueryOptions } from 'react-query';
import { chain } from 'wagmi';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import erc20Abi from 'lib/abis/ERC20.json';

import { Token } from './types';

const FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a'];

const useTokensBalancesQuery = (
	tokens: Token[],
	walletAddress: string | null,
	options?: UseQueryOptions<TokenBalances | null>
) => {
	const { network, provider, isWalletConnected } = Connector.useContainer();

	const filteredTokens = tokens.filter((t) => !FILTERED_TOKENS.includes(t.address.toLowerCase()));
	const symbols = filteredTokens.map((token) => token.symbol);
	const tokensMap = keyBy(filteredTokens, 'symbol');

	return useQuery<TokenBalances | null>(
		QUERY_KEYS.WalletBalances.Tokens(
			walletAddress,
			(network?.id ?? chain.optimism.id) as NetworkId,
			filteredTokens.map((f) => f.address).join()
		),
		async () => {
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
			enabled: !!provider && tokens.length > 0 && !!walletAddress && isWalletConnected,
			...options,
		}
	);
};

export default useTokensBalancesQuery;
