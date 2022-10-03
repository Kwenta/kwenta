import { CurrencyKey, NetworkId } from '@synthetixio/contracts-interface';
import { DeprecatedSynthBalance } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import axios from 'axios';
import { Provider as EthCallProvider, Contract as EthCallContract } from 'ethcall';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';

import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import { CG_BASE_API_URL } from 'queries/coingecko/constants';
import { PriceResponse } from 'queries/coingecko/types';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { getProxySynthSymbol } from 'queries/synths/utils';
import { OneInchTokenListResponse } from 'queries/tokenLists/types';
import { newGetCoinGeckoPricesForCurrencies } from 'utils/currencies';
import logError from 'utils/logError';

import type { ContractMap } from './contracts';
import SynthRedeemerABI from './contracts/abis/SynthRedeemer.json';

export default class ExchangeService {
	// private networkId: NetworkId;
	private contracts: ContractMap;
	private multicallProvider: EthCallProvider;

	constructor(networkId: NetworkId, contracts: ContractMap, multicallProvider: EthCallProvider) {
		// this.networkId = networkId;
		this.contracts = contracts;
		this.multicallProvider = multicallProvider;
	}

	public async getBaseFeeRate(sourceCurrencyKey: string, destinationCurrencyKey: string) {
		const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
			this.contracts.SystemSettings?.exchangeFeeRate(
				ethers.utils.formatBytes32String(sourceCurrencyKey)
			),
			this.contracts.SystemSettings?.exchangeFeeRate(
				ethers.utils.formatBytes32String(destinationCurrencyKey)
			),
		]);

		return sourceCurrencyFeeRate && destinationCurrencyFeeRate
			? sourceCurrencyFeeRate.add(destinationCurrencyFeeRate)
			: null;
	}

	public async getExchangeFeeRate(sourceCurrencyKey: string, destinationCurrencyKey: string) {
		return await this.contracts.Exchanger?.feeRateForExchange(
			ethers.utils.formatBytes32String(sourceCurrencyKey),
			ethers.utils.formatBytes32String(destinationCurrencyKey)
		);
	}

	private isCurrencyETH(currencyKey: string) {
		return currencyKey === CRYPTO_CURRENCY_MAP.ETH;
	}

	private getTokenAddress(currencyKey: string) {
		return '';
	}

	public async getRate(
		baseCurrencyKey: string,
		quoteCurrencyKey: string,
		baseRate: Wei,
		quoteRate: Wei,
		isL2: boolean
	) {
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);

		const coinGeckoPrices = await this.getCoingeckoPrices(
			[quoteCurrencyTokenAddress, baseCurrencyTokenAddress],
			isL2
		);

		const base = baseRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, baseCurrencyTokenAddress)
			: baseRate;

		const quote = quoteRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, quoteCurrencyTokenAddress)
			: quoteRate;

		return base.gt(0) && quote.gt(0) ? quote.div(base) : wei(0);
	}

	private async getCoingeckoPrices(tokenAddresses: string[], isL2: boolean) {
		const platform = isL2 ? 'optimistic-ethereum' : 'ethereum';
		const response = await axios.get<PriceResponse>(
			`${CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
				.join(',')
				.replace(ETH_ADDRESS, ETH_COINGECKO_ADDRESS)}&vs_currencies=usd`
		);
		return response.data;
	}

	public async getOneInchTokenList(isL2: boolean) {
		// TODO: Create getter for oneInchApiUrl
		const oneInchApiUrl = '';
		const response = await axios.get<OneInchTokenListResponse>(oneInchApiUrl + 'tokens');

		const tokensMap = response.data.tokens || {};
		const chainId: NetworkId = isL2 ? 10 : 1;
		const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }));

		return {
			tokens,
			tokensMap: keyBy(tokens, 'symbol'),
			symbols: tokens.map((token) => token.symbol),
		};
	}

	private tokensList: {} = {};

	private getAllTokensList(isL2: boolean) {
		const oneInchTokensMap = this.getOneInchTokenList(isL2);

		return { ...oneInchTokensMap };
	}

	private getFeeReclaimPeriods() {}

	private getOneInchQuote() {}

	private getBalance(currencyKey: string) {}

	private getQuotePriceRate() {}

	private async getTxProvider(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const synthsMap: Record<string, any> = {};
		const { tokensMap } = await this.getOneInchTokenList(true);

		if (!baseCurrencyKey || !quoteCurrencyKey) return null;
		if (synthsMap[baseCurrencyKey] && synthsMap[quoteCurrencyKey]) return 'synthetix';
		if (tokensMap[baseCurrencyKey] && tokensMap[quoteCurrencyKey]) return '1inch';

		return 'synthswap';
	}

	private checkIsAtomic(isL2: boolean, baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
			return false;
		}

		return [baseCurrencyKey, quoteCurrencyKey].every((currency) =>
			ATOMIC_EXCHANGES_L1.includes(currency)
		);
	}

	private async checkNeedsApproval(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = await this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const isQuoteCurrencyETH = this.isCurrencyETH(quoteCurrencyKey);

		return (txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH;
	}

	private getExchangeParams(
		sourceCurrencyKey: string,
		destinationCurrencyKey: string,
		sourceAmount: Wei,
		minAmount: Wei,
		walletAddress: string,
		isL2: boolean
	) {
		const sourceAmountBN = sourceAmount.toBN();
		const minAmountBN = minAmount.toBN();
		const isAtomic = this.checkIsAtomic(isL2, sourceCurrencyKey, destinationCurrencyKey);

		if (isAtomic) {
			return [
				sourceCurrencyKey,
				sourceAmount,
				destinationCurrencyKey,
				KWENTA_TRACKING_CODE,
				minAmountBN,
			];
		} else {
			return [
				sourceCurrencyKey,
				sourceAmountBN,
				destinationCurrencyKey,
				walletAddress,
				KWENTA_TRACKING_CODE,
			];
		}
	}

	private async getRedeemableDeprecatedSynths(walletAddress: string) {
		if (!this.contracts?.SynthRedeemer) {
			throw new Error('The SynthRedeemer contract does not exist on this network.');
		}

		const synthDeprecatedFilter = this.contracts.SynthRedeemer.filters.SynthDeprecated();
		const deprecatedSynthsEvents = await this.contracts.SynthRedeemer.queryFilter(
			synthDeprecatedFilter
		);
		const deprecatedProxySynthsAddresses: string[] =
			deprecatedSynthsEvents.map((e) => e.args?.synth).filter(Boolean) ?? [];

		const Redeemer = new EthCallContract(this.contracts.SynthRedeemer.address, SynthRedeemerABI);

		const symbolCalls = [];
		const balanceCalls = [];

		for (const addr of deprecatedProxySynthsAddresses) {
			symbolCalls.push(getProxySynthSymbol(addr));
			balanceCalls.push(Redeemer.balanceOf(addr, walletAddress));
		}

		const deprecatedSynths = (await this.multicallProvider.all(symbolCalls)) as CurrencyKey[];
		const balanceData = (await this.multicallProvider.all(balanceCalls)) as ethers.BigNumber[];
		const balances = balanceData.map((balance) => wei(balance));

		let totalUSDBalance = wei(0);
		const cryptoBalances: DeprecatedSynthBalance[] = [];

		for (let i = 0; i < balances.length; i++) {
			const usdBalance = balances[i];
			if (usdBalance.gt(0)) {
				const currencyKey = deprecatedSynths[i];
				totalUSDBalance = totalUSDBalance.add(usdBalance);
				cryptoBalances.push({
					currencyKey,
					proxyAddress: deprecatedProxySynthsAddresses[i],
					balance: wei(0),
					usdBalance,
				});
			}
		}

		return { balances: cryptoBalances, totalUSDBalance };
	}

	public handleApprove(currencyKey: string) {
		logError(currencyKey);
	}

	public handleSettle() {}

	public handleExchange() {}

	public getSynthsBalances() {}
}
