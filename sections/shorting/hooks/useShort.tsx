import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { ethers, utils } from 'ethers';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import produce from 'immer';

import ArrowRightIcon from 'assets/svg/app/circle-arrow-right.svg';

import Wei, { wei } from '@synthetixio/wei';

import { CurrencyKey, Synths } from 'constants/currency';

import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';
import useCollateralShortRate from 'queries/collateral/useCollateralShortRate';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import TradeSummaryCard from 'sections/exchange/FooterCard/TradeSummaryCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import MarketClosureCard from 'sections/exchange/FooterCard/MarketClosureCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import TxApproveModal from 'sections/shared/modals/TxApproveModal';
import SelectShortCurrencyModal from 'sections/shared/modals/SelectShortCurrencyModal';
import useCurrencyPair from 'sections/exchange/hooks/useCurrencyPair';

import { isL2State, isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import { customShortCRatioState, shortCRatioState } from 'store/ui';

import { getExchangeRatesForCurrencies, synthToContractName } from 'utils/currencies';

import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { getTransactionPrice, normalizeGasLimit } from 'utils/network';

import { zeroBN, formatNumber } from 'utils/formatters/number';

import { NoTextTransform } from 'styles/common';
import { historicalShortsPositionState } from 'store/shorts';

import { SYNTHS_TO_SHORT } from '../constants';
import TransactionNotifier from 'containers/TransactionNotifier';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';
import { useGetL1SecurityFee } from 'hooks/useGetL1SecurityGasFee';
import useGas from 'hooks/useGas';

type ShortCardProps = {
	defaultBaseCurrencyKey?: CurrencyKey | null;
	defaultQuoteCurrencyKey?: CurrencyKey | null;
};

export type GasInfo = {
	limit: number;
	l1Fee: number;
};

const useShort = ({
	defaultBaseCurrencyKey = null,
	defaultQuoteCurrencyKey = null,
}: ShortCardProps) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthsMap, synthetixjs } = Connector.useContainer();

	const [currencyPair, setCurrencyPair] = useCurrencyPair<CurrencyKey>({
		persistSelectedCurrencies: false,
		defaultBaseCurrencyKey,
		defaultQuoteCurrencyKey,
	});

	const { useSynthsBalancesQuery, useExchangeRatesQuery } = useSynthetixQueries();

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const isAppReady = useRecoilValue(appReadyState);
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isL2 = useRecoilValue(isL2State);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txApproveModalOpen, setTxApproveModalOpen] = useState<boolean>(false);
	const [selectShortCurrencyModalOpen, setSelectShortCurrencyModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const { gasPrice, gasPriceWei, gasPrices } = useGas();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const selectedShortCRatio = useRecoilValue(shortCRatioState);
	const customShortCRatio = useRecoilValue(customShortCRatioState);
	const setHistoricalShortPositions = useSetRecoilState(historicalShortsPositionState);
	const getL1SecurityFee = useGetL1SecurityFee();

	const shortCRatio = useMemo(
		() => (customShortCRatio !== '' ? Number(customShortCRatio) / 100 : selectedShortCRatio),
		[customShortCRatio, selectedShortCRatio]
	);

	const [gasInfo, setGasInfo] = useState<GasInfo | null>(null);

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();
	const collateralShortRateQuery = useCollateralShortRate(baseCurrencyKey);

	const collateralShortContractInfo = collateralShortContractInfoQuery.isSuccess
		? collateralShortContractInfoQuery?.data ?? null
		: null;

	const issueFeeRate = collateralShortContractInfo?.issueFeeRate;
	const minCratio = collateralShortContractInfo?.minCollateralRatio;
	const minCollateral = collateralShortContractInfo?.minCollateral;

	const shortRate = collateralShortRateQuery.isSuccess
		? collateralShortRateQuery?.data ?? null
		: null;

	const shortCRatioTooLow = useMemo(
		() => (minCratio != null ? wei(shortCRatio).lt(minCratio) : false),
		[shortCRatio, minCratio]
	);

	const baseCurrency = baseCurrencyKey != null ? synthsMap[baseCurrencyKey] : null;
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const rate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey),
		[exchangeRates, quoteCurrencyKey, baseCurrencyKey]
	);
	const inverseRate = useMemo(() => (rate > 0 ? 1 / rate : 0), [rate]);

	const baseCurrencyBalance =
		baseCurrencyKey != null && synthsWalletBalancesQuery.isSuccess
			? get(synthsWalletBalancesQuery.data, ['balancesMap', baseCurrencyKey, 'balance'], zeroBN)
			: null;

	let quoteCurrencyBalance: Wei | null = null;
	if (quoteCurrencyKey != null) {
		quoteCurrencyBalance = synthsWalletBalancesQuery.isSuccess
			? get(synthsWalletBalancesQuery.data, ['balancesMap', quoteCurrencyKey, 'balance'], zeroBN)
			: null;
	}

	const basePriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, selectedPriceCurrency.name),
		[exchangeRates, baseCurrencyKey, selectedPriceCurrency.name]
	);
	const quotePriceRate = useMemo(
		() =>
			getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, selectedPriceCurrency.name),
		[exchangeRates, quoteCurrencyKey, selectedPriceCurrency.name]
	);
	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const baseCurrencyAmountBN = baseCurrencyAmount ? wei(baseCurrencyAmount) : wei(0);
	const quoteCurrencyAmountBN = quoteCurrencyAmount ? wei(quoteCurrencyAmount) : wei(0);

	const totalTradePrice = useMemo(() => {
		let tradePrice = quoteCurrencyAmountBN.mul(quotePriceRate);
		if (selectPriceCurrencyRate && selectPriceCurrencyRate.gt(0)) {
			tradePrice = tradePrice.div(selectPriceCurrencyRate);
		}

		return tradePrice;
	}, [quoteCurrencyAmountBN, quotePriceRate, selectPriceCurrencyRate]);

	const selectedBothSides = useMemo(() => baseCurrencyKey != null && quoteCurrencyKey != null, [
		baseCurrencyKey,
		quoteCurrencyKey,
	]);

	const baseCurrencyMarketClosed = useMarketClosed(baseCurrencyKey);
	const quoteCurrencyMarketClosed = useMarketClosed(quoteCurrencyKey);

	const submissionDisabledReason: ReactNode = useMemo(() => {
		const insufficientBalance =
			quoteCurrencyBalance != null ? quoteCurrencyAmountBN.gt(quoteCurrencyBalance) : false;

		if (!selectedBothSides) {
			return t('exchange.summary-info.button.select-synth');
		}
		if (insufficientBalance) {
			return t('exchange.summary-info.button.insufficient-balance');
		}
		if (isSubmitting) {
			return t('exchange.summary-info.button.submitting-order');
		}
		if (isApproving) {
			return t('exchange.summary-info.button.approving');
		}
		if (!isWalletConnected || baseCurrencyAmountBN.lte(0) || quoteCurrencyAmountBN.lte(0)) {
			return t('exchange.summary-info.button.enter-amount');
		}
		if (shortCRatioTooLow) {
			return t('shorting.shorting-card.summary-info.button.c-ratio-too-low');
		}
		if (minCollateral != null && quoteCurrencyAmountBN.lt(minCollateral)) {
			return (
				<span>
					<Trans
						t={t}
						i18nKey="shorting.shorting-card.summary-info.button.min-collateral"
						values={{ amount: formatNumber(minCollateral), currencyKey: quoteCurrencyKey }}
						components={[<span />, <NoTextTransform />]}
					/>
				</span>
			);
		}
		return null;
	}, [
		quoteCurrencyKey,
		shortCRatioTooLow,
		isApproving,
		quoteCurrencyBalance,
		selectedBothSides,
		isSubmitting,
		baseCurrencyAmountBN,
		quoteCurrencyAmountBN,
		isWalletConnected,
		minCollateral,
		t,
	]);

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
			: false;

	// TODO: grab these from the smart contract
	const synthsAvailableToShort = useMemo(() => {
		if (isAppReady) {
			return synthetixjs!.synths.filter((synth) =>
				SYNTHS_TO_SHORT.includes(synth.name as CurrencyKey)
			);
		}
		return [];
	}, [isAppReady, synthetixjs]);

	const transactionFee = useMemo(
		() => getTransactionPrice(gasPrice, gasInfo?.limit, ethPriceRate, gasInfo?.l1Fee),
		[gasPrice, gasInfo?.limit, ethPriceRate, gasInfo?.l1Fee]
	);

	const feeAmountInBaseCurrency = useMemo(() => {
		if (issueFeeRate != null && baseCurrencyAmount) {
			return wei(baseCurrencyAmount).mul(issueFeeRate);
		}
		return null;
	}, [baseCurrencyAmount, issueFeeRate]);

	const feeCost = useMemo(() => {
		if (feeAmountInBaseCurrency != null) {
			return feeAmountInBaseCurrency.mul(basePriceRate);
		}
		return null;
	}, [feeAmountInBaseCurrency, basePriceRate]);

	const checkAllowance = useCallback(async () => {
		if (isWalletConnected && quoteCurrencyKey != null && quoteCurrencyAmount) {
			try {
				const { contracts } = synthetixjs!;

				const allowance = (await contracts[synthToContractName(quoteCurrencyKey)].allowance(
					walletAddress,
					contracts.CollateralShort.address
				)) as ethers.BigNumber;

				setIsApproved(wei(ethers.utils.formatEther(allowance)).gte(quoteCurrencyAmount));
			} catch (e) {
				console.log(e);
			}
		}
	}, [quoteCurrencyAmount, isWalletConnected, quoteCurrencyKey, walletAddress, synthetixjs]);

	useEffect(() => {
		checkAllowance();
	}, [checkAllowance]);

	// An attempt to show correct gas fees while making as few calls as possible. (as soon as the submission is "valid", compute it once)
	useEffect(() => {
		const getGasEstimate = async () => {
			if (gasInfo == null && submissionDisabledReason == null) {
				const gasEstimate = await getGasEstimateForShort();
				setGasInfo(gasEstimate);
			}
		};
		getGasEstimate();
		// eslint-disable-next-line
	}, [submissionDisabledReason, gasInfo]);

	// reset estimated gas limit when currencies are changed.
	useEffect(() => {
		setGasInfo(null);
	}, [baseCurrencyKey, quoteCurrencyKey]);

	function resetCurrencies() {
		setQuoteCurrencyAmount('');
		setBaseCurrencyAmount('');
	}

	useEffect(() => {
		resetCurrencies();
	}, [shortCRatio]);

	const getShortParams = () => {
		return [
			quoteCurrencyAmountBN.toBN(),
			baseCurrencyAmountBN.toBN(),
			ethers.utils.formatBytes32String(baseCurrencyKey!),
		];
	};

	const getGasEstimateForShort = async () => {
		if (gasPrice && synthetixjs) {
			try {
				const params = getShortParams();
				const gasEstimate = await synthetixjs!.contracts.CollateralShort.estimateGas.open(
					...params
				);
				const limit = normalizeGasLimit(Number(gasEstimate));

				const metaTx = await synthetixjs!.contracts.CollateralShort.populateTransaction.open(
					...params
				);

				const l1Fee = await getL1SecurityFee({
					...metaTx,
					gasPrice: gasPriceWei,
					gasLimit: limit,
				});

				return { limit, l1Fee };
			} catch (e) {
				console.log(e);
			}
		}

		return null;
	};

	const handleApprove = async () => {
		if (quoteCurrencyKey != null && gasPrice != null) {
			setTxError(null);
			setTxApproveModalOpen(true);

			try {
				setIsApproving(true);

				const { contracts } = synthetixjs!;

				const collateralContract = contracts[synthToContractName(quoteCurrencyKey)];

				const gasEstimate = !isL2
					? await collateralContract.estimateGas.approve(
							contracts.CollateralShort.address,
							ethers.constants.MaxUint256
					  )
					: null;
				const tx = await collateralContract.approve(
					contracts.CollateralShort.address,
					ethers.constants.MaxUint256,
					{
						...(!isL2 && { gasLimit: normalizeGasLimit(Number(gasEstimate)) }),
						gasPrice: gasPriceWei,
					}
				);
				if (tx != null) {
					monitorTransaction({
						txHash: tx.hash,
						onTxConfirmed: () => {
							setIsApproving(false);
							// TODO: check for allowance or can we assume its ok?
							setIsApproved(true);
						},
					});
				}
				setTxApproveModalOpen(false);
			} catch (e) {
				console.log(e);
				setIsApproving(false);
				setTxError(e.message);
			}
		}
	};

	const onLoanCreated = useCallback(
		async (
			_owner: string,
			loanId: ethers.BigNumber,
			amount: ethers.BigNumber,
			collateral: ethers.BigNumber,
			currency: string,
			_issueFee: ethers.BigNumber,
			tx: ethers.Event
		) => {
			if (synthetixjs != null) {
				// const { CollateralShort } = synthetix.js.contracts;

				setHistoricalShortPositions((orders) =>
					produce(orders, (draftState) => {
						draftState.push({
							id: loanId.toString(),
							accruedInterest: wei(0),
							synthBorrowed: utils.parseBytes32String(currency) as CurrencyKey,
							synthBorrowedAmount: wei(amount),
							collateralLocked: Synths.sUSD,
							collateralLockedAmount: wei(collateral),
							txHash: tx.transactionHash,
							isOpen: true,
							createdAt: new Date(),
							closedAt: null,
							profitLoss: null,
						});
					})
				);
			}
		},
		[setHistoricalShortPositions, synthetixjs]
	);

	const handleSubmit = async () => {
		if (synthetixjs != null && gasPrice != null) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			const { CollateralShort } = synthetixjs.contracts;

			try {
				setIsSubmitting(true);

				let tx: ethers.ContractTransaction | null = null;

				const gasEstimate = await getGasEstimateForShort();

				setGasInfo(gasEstimate);

				tx = (await CollateralShort.open(...getShortParams(), {
					gasPrice: gasPriceWei,
					gasLimit: gasEstimate?.limit,
				})) as ethers.ContractTransaction;

				if (tx != null) {
					monitorTransaction({
						txHash: tx.hash,
						onTxConfirmed: () => {
							synthsWalletBalancesQuery.refetch();
						},
					});
				}
				setTxConfirmationModalOpen(false);
				setTxConfirmationModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(e.message);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	useEffect(() => {
		const unsubs: Function[] = [];

		if (isAppReady && walletAddress != null) {
			const { CollateralShort } = synthetixjs!.contracts;

			const loanCreatedEvent = CollateralShort?.filters.LoanCreated(walletAddress);

			CollateralShort?.on(loanCreatedEvent, onLoanCreated);
			unsubs.push(() => CollateralShort?.off(loanCreatedEvent, onLoanCreated));
		}
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [isAppReady, walletAddress, onLoanCreated, synthetixjs]);

	const quoteCurrencyCard = (
		<CurrencyCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			amount={quoteCurrencyAmount}
			onAmountChange={(value) => {
				if (value === '') {
					setQuoteCurrencyAmount('');
					setBaseCurrencyAmount('');
				} else {
					setQuoteCurrencyAmount(value);
					setBaseCurrencyAmount(wei(value).mul(rate).div(shortCRatio).toString());
				}
			}}
			walletBalance={quoteCurrencyBalance}
			onBalanceClick={() => {
				if (quoteCurrencyBalance != null) {
					setQuoteCurrencyAmount(quoteCurrencyBalance.toString());
					setBaseCurrencyAmount(quoteCurrencyBalance.mul(rate).div(shortCRatio).toString());
				}
			}}
			priceRate={quotePriceRate}
			label={t('shorting.common.collateral')}
		/>
	);

	const baseCurrencyCard = (
		<CurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			amount={baseCurrencyAmount}
			onAmountChange={(value) => {
				if (value === '') {
					setBaseCurrencyAmount('');
					setQuoteCurrencyAmount('');
				} else {
					setBaseCurrencyAmount(value);
					setQuoteCurrencyAmount(wei(value).mul(inverseRate).mul(shortCRatio).toString());
				}
			}}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={() => {
				if (baseCurrencyBalance != null) {
					setBaseCurrencyAmount(baseCurrencyBalance.toString());
					setQuoteCurrencyAmount(
						wei(baseCurrencyBalance).mul(inverseRate).mul(shortCRatio).toString()
					);
				}
			}}
			onCurrencySelect={() => setSelectShortCurrencyModalOpen(true)}
			priceRate={basePriceRate}
			label={t('shorting.common.shorting')}
		/>
	);

	const footerCard = (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={true} />
			) : baseCurrencyMarketClosed.isMarketClosed || quoteCurrencyMarketClosed.isMarketClosed ? (
				<MarketClosureCard
					baseCurrencyMarketClosed={baseCurrencyMarketClosed}
					quoteCurrencyMarketClosed={quoteCurrencyMarketClosed}
					attached={true}
					quoteCurrencyKey={quoteCurrencyKey}
					baseCurrencyKey={baseCurrencyKey}
				/>
			) : noSynths ? (
				<NoSynthsCard attached={true} />
			) : (
				<TradeSummaryCard
					attached={true}
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={isApproved ? handleSubmit : handleApprove}
					totalTradePrice={totalTradePrice.toString()}
					baseCurrencyAmount={baseCurrencyAmount}
					basePriceRate={basePriceRate}
					baseCurrency={baseCurrency || null}
					gasPrices={gasPrices}
					feeReclaimPeriodInSeconds={0}
					quoteCurrencyKey={quoteCurrencyKey}
					totalFeeRate={issueFeeRate ?? null}
					baseFeeRate={issueFeeRate ?? null}
					transactionFee={transactionFee}
					feeCost={feeCost}
					showFee={true}
					isApproved={isApproved}
					isCreateShort={true}
					shortInterestRate={shortRate}
				/>
			)}
			{txConfirmationModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxConfirmationModalOpen(false)}
					txError={txError}
					attemptRetry={handleSubmit}
					baseCurrencyAmount={baseCurrencyAmount}
					quoteCurrencyAmount={quoteCurrencyAmount}
					baseCurrencyKey={baseCurrencyKey!}
					quoteCurrencyKey={quoteCurrencyKey!}
					totalTradePrice={totalTradePrice.toString()}
					txProvider="synthetix"
					feeCost={feeCost}
					quoteCurrencyLabel={t('shorting.common.posting')}
					baseCurrencyLabel={t('shorting.common.shorting')}
					icon={<Svg src={ArrowRightIcon} />}
				/>
			)}
			{txApproveModalOpen && (
				<TxApproveModal
					onDismiss={() => setTxApproveModalOpen(false)}
					txError={txError}
					attemptRetry={handleApprove}
					currencyKey={quoteCurrencyKey!}
					currencyLabel={<NoTextTransform>{quoteCurrencyKey}</NoTextTransform>}
				/>
			)}
			{selectShortCurrencyModalOpen && quoteCurrencyKey != null && (
				<SelectShortCurrencyModal
					onDismiss={() => setSelectShortCurrencyModalOpen(false)}
					onSelect={(currencyKey) => {
						resetCurrencies();
						// @ts-ignore
						setCurrencyPair((pair) => ({
							base: currencyKey,
							quote: pair.quote === currencyKey ? null : pair.quote,
						}));
					}}
					synths={synthsAvailableToShort}
					collateralCurrencyKey={quoteCurrencyKey}
				/>
			)}
		</>
	);

	return {
		baseCurrencyKey,
		quoteCurrencyKey,
		inverseRate,
		quoteCurrencyCard,
		baseCurrencyCard,
		footerCard,
	};
};

export default useShort;
