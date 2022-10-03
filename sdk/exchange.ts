import { CurrencyKey, NetworkId } from '@synthetixio/contracts-interface';
import { DeprecatedSynthBalance } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import axios from 'axios';
import { Provider as EthCallProvider, Contract as EthCallContract } from 'ethcall';
import { ethers, Signer } from 'ethers';
import { get, keyBy } from 'lodash';

import {
	ATOMIC_EXCHANGES_L1,
	CRYPTO_CURRENCY_MAP,
	ETH_ADDRESS,
	ETH_COINGECKO_ADDRESS,
} from 'constants/currency';
import erc20Abi from 'lib/abis/ERC20.json';
import { CG_BASE_API_URL } from 'queries/coingecko/constants';
import { PriceResponse } from 'queries/coingecko/types';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { getProxySynthSymbol } from 'queries/synths/utils';
import { OneInchTokenListResponse, Token } from 'queries/tokenLists/types';
import { newGetCoinGeckoPricesForCurrencies } from 'utils/currencies';

import type { ContractMap } from './contracts';
import SynthRedeemerABI from './contracts/abis/SynthRedeemer.json';
import { getSynthsForNetwork } from './data/synths';

export default class ExchangeService {
	private networkId: NetworkId;
	private signer: Signer;
	private contracts: ContractMap;
	private multicallProvider: EthCallProvider;
	private isL2: boolean;
	private tokensMap: any = {};
	private tokenList: Token[] = [];
	private allTokensMap: any;

	constructor(
		networkId: NetworkId,
		signer: Signer,
		contracts: ContractMap,
		multicallProvider: EthCallProvider
	) {
		this.networkId = networkId;
		this.signer = signer;
		this.isL2 = [10, 420].includes(networkId);
		this.contracts = contracts;
		this.multicallProvider = multicallProvider;
		this.getAllTokensMap();
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
		if (currencyKey != null) {
			if (this.isCurrencyETH(currencyKey)) {
				return ETH_ADDRESS;
			} else {
				return get(this.allTokensMap, [currencyKey, 'address'], null);
			}
		} else {
			return null;
		}
	}

	public async getRate(
		baseCurrencyKey: string,
		quoteCurrencyKey: string,
		baseRate: Wei,
		quoteRate: Wei
	) {
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey);
		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey);

		const coinGeckoPrices = await this.getCoingeckoPrices([
			quoteCurrencyTokenAddress,
			baseCurrencyTokenAddress,
		]);

		const base = baseRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, baseCurrencyTokenAddress)
			: baseRate;

		const quote = quoteRate.lte(0)
			? newGetCoinGeckoPricesForCurrencies(coinGeckoPrices, quoteCurrencyTokenAddress)
			: quoteRate;

		return base.gt(0) && quote.gt(0) ? quote.div(base) : wei(0);
	}

	private async getCoingeckoPrices(tokenAddresses: string[]) {
		const platform = this.isL2 ? 'optimistic-ethereum' : 'ethereum';
		const response = await axios.get<PriceResponse>(
			`${CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
				.join(',')
				.replace(ETH_ADDRESS, ETH_COINGECKO_ADDRESS)}&vs_currencies=usd`
		);
		return response.data;
	}

	public async getOneInchTokenList() {
		const oneInchApiUrl = `https://api.1inch.io/v4.0/${this.isL2 ? 10 : 1}`;
		const response = await axios.get<OneInchTokenListResponse>(oneInchApiUrl + 'tokens');

		const tokensMap = response.data.tokens || {};
		const chainId: NetworkId = this.isL2 ? 10 : 1;
		const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }));

		return {
			tokens,
			tokensMap: keyBy(tokens, 'symbol'),
			symbols: tokens.map((token) => token.symbol),
		};
	}

	public async getFeeReclaimPeriod(currencyKey: string, walletAddress: string) {
		if (!this.contracts.Exchanger) {
			throw new Error('The Exchanger contract does not exist on the currently selected network.');
		}

		const maxSecsLeftInWaitingPeriod = (await this.contracts.Exchanger.maxSecsLeftInWaitingPeriod(
			walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		)) as ethers.BigNumberish;

		return Number(maxSecsLeftInWaitingPeriod);
	}

	private getOneInchQuote() {}

	private getBalance(currencyKey: string) {}

	private async getQuotePriceRate(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		const isQuoteCurrencyETH = this.isCurrencyETH(quoteCurrencyKey);

		const quoteCurrencyTokenAddress = this.getTokenAddress(quoteCurrencyKey).toLowerCase();
		const baseCurrencyTokenAddress = this.getTokenAddress(baseCurrencyKey).toLowerCase();

		const coinGeckoPrices = await this.getCoingeckoPrices([
			quoteCurrencyTokenAddress,
			baseCurrencyTokenAddress,
		]);

		if (coinGeckoPrices) {
			const quotePrice = coinGeckoPrices[quoteCurrencyTokenAddress];

			// TODO: Remove this:
			const selectPriceCurrencyRate = wei(0);

			return quotePrice ? quotePrice.usd / selectPriceCurrencyRate.toNumber() : wei(0);
		} else {
		}
	}

	private async getTxProvider(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const synthsMap: Record<string, any> = {};

		if (!baseCurrencyKey || !quoteCurrencyKey) return null;
		if (synthsMap[baseCurrencyKey] && synthsMap[quoteCurrencyKey]) return 'synthetix';
		if (this.tokensMap[baseCurrencyKey] && this.tokensMap[quoteCurrencyKey]) return '1inch';

		return 'synthswap';
	}

	private async getOneInchSlippage(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const txProvider = await this.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

		if (txProvider === '1inch' && (baseCurrencyKey === 'ETH' || quoteCurrencyKey === 'ETH')) {
			return 3;
		}

		return 1;
	}

	private getSelectedTokens(baseCurrencyKey: string, quoteCurrencyKey: string) {
		return this.tokenList.filter(
			(t) => t.symbol === baseCurrencyKey || t.symbol === quoteCurrencyKey
		);
	}

	private async getAllTokensMap() {
		const synthsMap = getSynthsForNetwork(this.networkId);

		const { tokensMap, tokens } = await this.getOneInchTokenList();

		this.tokensMap = tokensMap;
		this.tokenList = tokens;
		this.allTokensMap = { ...synthsMap, tokensMap };
	}

	private checkIsAtomic(baseCurrencyKey: string, quoteCurrencyKey: string) {
		if (this.isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
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
		walletAddress: string
	) {
		const sourceAmountBN = sourceAmount.toBN();
		const minAmountBN = minAmount.toBN();
		const isAtomic = this.checkIsAtomic(sourceCurrencyKey, destinationCurrencyKey);

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

	private getTokenDecimals(currencyKey: string) {
		return get(this.allTokensMap, [currencyKey, 'decimals'], undefined);
	}

	private async getQuoteCurrencyContract(baseCurrencyKey: string, quoteCurrencyKey: string) {
		const needsApproval = await this.checkNeedsApproval(baseCurrencyKey, quoteCurrencyKey);

		if (quoteCurrencyKey && this.allTokensMap[quoteCurrencyKey] && needsApproval) {
			const quoteTknAddress = this.allTokensMap[quoteCurrencyKey].address;
			return createERC20Contract(quoteTknAddress, this.signer);
		}
		return null;
	}

	public async getNumEntries(walletAddress: string, currencyKey: string) {
		if (!this.contracts.Exchanger) {
			throw new Error('Something something wrong?');
		}

		const { numEntries } = await this.contracts.Exchanger.settlementOwing(
			walletAddress,
			ethers.utils.formatBytes32String(currencyKey)
		);

		return numEntries ?? null;
	}

	public handleApprove(currencyKey: string) {}

	public handleSettle() {}

	public handleExchange() {}

	public getSynthsBalances() {}
}

const createERC20Contract = (tokenAddress: string, signer: Signer) =>
	new ethers.Contract(tokenAddress, erc20Abi, signer);
