import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';
import { SOR } from '@balancer-labs/sor';
import { BigNumber } from 'bignumber.js';
import { NetworkId, NetworkIdByName } from '@synthetixio/contracts-interface';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';

import { CurrencyKey, Synths, sUSD_EXCHANGE_RATE, SYNTH_DECIMALS } from 'constants/currency';
import useInterval from 'hooks/useInterval';

import Connector from 'containers/Connector';
import BlockExplorer from 'containers/BlockExplorer';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import TradeBalancerSummaryCard from 'sections/exchange/FooterCard/TradeBalancerSummaryCard';
import NoSynthsCard from 'sections/exchange/FooterCard/NoSynthsCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import BalancerApproveModal from 'sections/shared/modals/BalancerApproveModal';

import { hasOrdersNotificationState } from 'store/ui';
import {
	customGasPriceState,
	gasSpeedState,
	isWalletConnectedState,
	walletAddressState,
} from 'store/wallet';
import { ordersState } from 'store/orders';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { normalizeGasLimit } from 'utils/network';
import useCurrencyPair from './useCurrencyPair';
import { zeroBN, scale } from 'utils/formatters/number';

import balancerExchangeProxyABI from './balancerExchangeProxyABI';
import TransactionNotifier from 'containers/TransactionNotifier';
import { GasPrices } from '@synthetixio/queries';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';

type ExchangeCardProps = {
	defaultBaseCurrencyKey?: CurrencyKey | null;
	defaultQuoteCurrencyKey?: CurrencyKey | null;
	footerCardAttached?: boolean;
	persistSelectedCurrencies?: boolean;
	showNoSynthsCard?: boolean;
};

const BALANCER_LINKS = {
	[NetworkIdByName.mainnet]: {
		poolsUrl: 'https://storageapi.fleek.co/balancer-bucket/balancer-exchange/pools',
		proxyAddr: '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21', // Balancer Mainnet proxy
	},
	[NetworkIdByName.kovan]: {
		poolsUrl:
			'https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange-kovan/pools',
		proxyAddr: '0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec', // Kovan proxy
	},
};

const useBalancerExchange = ({
	defaultBaseCurrencyKey = null,
	defaultQuoteCurrencyKey = null,
	footerCardAttached = false,
	persistSelectedCurrencies = false,
	showNoSynthsCard = true,
}: ExchangeCardProps) => {
	const { t } = useTranslation();
	const { transactionNotifier, provider, signer, network, synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const {
		useSynthsBalancesQuery,
		useEthGasPriceQuery,
		useFeeReclaimPeriodQuery,
	} = useSynthetixQueries();

	const [currencyPair, setCurrencyPair] = useCurrencyPair({
		persistSelectedCurrencies,
		defaultBaseCurrencyKey,
		defaultQuoteCurrencyKey,
	});
	const [hasSetCostOutputTokenCalled, setHasSetCostOutputTokenCalled] = useState<boolean>(false);
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [baseCurrencyAddress, setBaseCurrencyAddress] = useState<string | null>(null);
	const [quoteCurrencyAddress, setQuoteCurrencyAddress] = useState<string | null>(null);
	const [smartOrderRouter, setSmartOrderRouter] = useState<SOR | null>(null);
	const [balancerProxyContract, setBalancerProxyContract] = useState<ethers.Contract | null>(null);
	const [approveError, setApproveError] = useState<string | null>(null);
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [baseAllowance, setBaseAllowance] = useState<string | null>(null);
	const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
	const [maxSlippageTolerance, setMaxSlippageTolerance] = useState<string>('0.01');
	const [estimatedSlippage, setEstimatedSlippage] = useState<Wei>(wei(0));

	const [swaps, setSwaps] = useState<Array<any> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const walletAddress = useRecoilValue(walletAddressState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const gasSpeed = useRecoilValue<keyof GasPrices>(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress || '');
	const ethGasPriceQuery = useEthGasPriceQuery();
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey, walletAddress);
	const { selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.isSuccess
		? feeReclaimPeriodQuery.data ?? 0
		: 0;

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

	const selectedBothSides = baseCurrencyKey != null && quoteCurrencyKey != null;

	let baseCurrencyAmountBN = wei(0);
	let quoteCurrencyAmountBN = wei(0);
	let basePriceRate: Wei | null = null;
	let quotePriceRate: Wei | null = null;
	let totalTradePrice: Wei | null = null;
	try {
		baseCurrencyAmountBN = wei(baseCurrencyAmount !== '' ? baseCurrencyAmount : 0);
		quoteCurrencyAmountBN = wei(quoteCurrencyAmount !== '' ? quoteCurrencyAmount : 0);

		if (baseCurrencyAmountBN.gt(0) && quoteCurrencyAmountBN.gt(0)) {
			basePriceRate =
				baseCurrencyKey === Synths.sUSD
					? sUSD_EXCHANGE_RATE
					: baseCurrencyAmountBN.div(quoteCurrencyAmountBN);
			quotePriceRate =
				quoteCurrencyKey === Synths.sUSD && baseCurrencyAmountBN.gt(0)
					? sUSD_EXCHANGE_RATE
					: quoteCurrencyAmountBN.div(baseCurrencyAmountBN);

			totalTradePrice =
				baseCurrencyKey === Synths.sUSD
					? baseCurrencyAmountBN.mul(basePriceRate)
					: quoteCurrencyAmountBN.mul(quotePriceRate);

			if (selectPriceCurrencyRate) {
				totalTradePrice = totalTradePrice.div(selectPriceCurrencyRate);
			}
		}
	} catch {}

	const isApproved = useMemo(
		() =>
			!(
				baseAllowance == null ||
				baseAllowance === '0' ||
				scale(quoteCurrencyAmountBN, SYNTH_DECIMALS).gte(baseAllowance)
			),
		[baseAllowance, quoteCurrencyAmountBN]
	);

	const submissionDisabledReason: ReactNode = useMemo(() => {
		const insufficientBalance =
			quoteCurrencyBalance != null ? quoteCurrencyAmountBN.gt(quoteCurrencyBalance) : false;

		if (feeReclaimPeriodInSeconds > 0) {
			return t('exchange.summary-info.button.fee-reclaim-period');
		}
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
			return t('exchange.summary-info.button.submitting-approval');
		}
		if (!isWalletConnected || baseCurrencyAmountBN.lte(0) || quoteCurrencyAmountBN.lte(0)) {
			return t('exchange.summary-info.button.enter-amount');
		}
		return null;
	}, [
		quoteCurrencyBalance,
		selectedBothSides,
		isSubmitting,
		feeReclaimPeriodInSeconds,
		baseCurrencyAmountBN,
		quoteCurrencyAmountBN,
		isWalletConnected,
		isApproving,
		t,
	]);

	const noSynths =
		synthsWalletBalancesQuery.isSuccess && synthsWalletBalancesQuery.data
			? synthsWalletBalancesQuery.data.balances.length === 0
			: false;

	const handleCurrencySwap = () => {
		const baseAmount = baseCurrencyAmount;
		const quoteAmount = quoteCurrencyAmount;

		setCurrencyPair({
			base: quoteCurrencyKey,
			quote: baseCurrencyKey,
		});

		setBaseCurrencyAmount(quoteAmount);
		setQuoteCurrencyAmount(baseAmount);
	};

	const gasPrice = useMemo(
		() =>
			customGasPrice !== ''
				? wei(customGasPrice, 9)
				: ethGasPriceQuery.data != null
				? wei(ethGasPriceQuery.data[gasSpeed], 9)
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed]
	);

	const feeAmountInBaseCurrency = wei(0);
	/*const feeAmountInBaseCurrency = useMemo(() => {
		if (exchangeFeeRate != null && baseCurrencyAmount) {
			return wei(baseCurrencyAmount).mul(exchangeFeeRate);
		}
		return null;
	}, [baseCurrencyAmount, exchangeFeeRate]);*/

	useEffect(() => {
		if (
			synthetixjs != null &&
			provider != null &&
			gasPrice != null &&
			network?.id != null &&
			(network.id === NetworkIdByName.mainnet || network.id === NetworkIdByName.kovan)
		) {
			const maxNoPools = 2;
			const sor = new SOR(
				// @ts-ignore
				provider as ethers.providers.BaseProvider,
				new BigNumber(gasPrice.toString()),
				maxNoPools,
				network?.id,
				BALANCER_LINKS[network.id].poolsUrl
			);
			sor.fetchPools();
			setSmartOrderRouter(sor);
		}
	}, [provider, gasPrice, network?.id, synthetixjs]);

	useInterval(
		async () => {
			if (smartOrderRouter != null) {
				smartOrderRouter.fetchPools();
			}
		},
		60 * 1000,
		[smartOrderRouter, quoteCurrencyAddress]
	);
	const getAllowanceAndInitProxyContract = useCallback(
		async ({
			address,
			key,
			id,
			contractNeedsInit,
		}: {
			address: string | null;
			key: CurrencyKey | null;
			id: NetworkId | null;
			contractNeedsInit: boolean;
		}) => {
			if (
				address != null &&
				key != null &&
				synthetixjs != null &&
				signer != null &&
				id != null &&
				(id === NetworkIdByName.mainnet || id === NetworkIdByName.kovan)
			) {
				if (contractNeedsInit) {
					const proxyContract = new ethers.Contract(
						BALANCER_LINKS[id].proxyAddr,
						balancerExchangeProxyABI,
						signer
					);
					setBalancerProxyContract(proxyContract);
				}
				const allowance = await synthetixjs!.contracts[`Synth${key}`].allowance(
					address,
					BALANCER_LINKS[id].proxyAddr
				);
				setBaseAllowance(allowance.toString());
			}
		},
		[signer, synthetixjs]
	);

	useEffect(() => {
		getAllowanceAndInitProxyContract({
			address: walletAddress,
			key: quoteCurrencyKey,
			id: network?.id ?? null,
			contractNeedsInit: true,
		});
	}, [walletAddress, quoteCurrencyKey, network?.id, getAllowanceAndInitProxyContract]);

	useEffect(() => {
		async function callSetCostOutputTokenCalled() {
			if (
				smartOrderRouter != null &&
				!hasSetCostOutputTokenCalled &&
				quoteCurrencyAddress != null
			) {
				await smartOrderRouter.setCostOutputToken(quoteCurrencyAddress);
				setHasSetCostOutputTokenCalled(true);
			}
		}
		callSetCostOutputTokenCalled();
	}, [
		smartOrderRouter,
		hasSetCostOutputTokenCalled,
		quoteCurrencyAddress,
		setHasSetCostOutputTokenCalled,
	]);

	useEffect(() => {
		if (synthetixjs && baseCurrencyKey != null && quoteCurrencyKey != null) {
			setBaseCurrencyAddress(synthetixjs.contracts[`Synth${baseCurrencyKey}`].address);
			setQuoteCurrencyAddress(synthetixjs.contracts[`Synth${quoteCurrencyKey}`].address);
		}
	}, [baseCurrencyKey, quoteCurrencyKey, synthetixjs]);

	const calculateExchangeRate = useCallback(
		async ({ value, isBase }: { value: Wei; isBase: boolean }) => {
			if (smartOrderRouter != null && quoteCurrencyAddress != null && baseCurrencyAddress != null) {
				const swapType = isBase ? 'swapExactOut' : 'swapExactIn';
				const amount = wei(value);
				const smallAmount = wei(0.001);
				const [tradeSwaps, resultingAmount] = await smartOrderRouter.getSwaps(
					quoteCurrencyAddress,
					baseCurrencyAddress,
					swapType,
					new BigNumber(amount.toString(0, true))
				);

				console.log(
					'request was',
					quoteCurrencyAddress,
					baseCurrencyAddress,
					swapType,
					new BigNumber(amount.toString(0, true)).toString()
				);

				console.log('got resulting amount', resultingAmount.toString());

				const [, smallTradeResult] = await smartOrderRouter.getSwaps(
					quoteCurrencyAddress,
					baseCurrencyAddress,
					swapType,
					new BigNumber(smallAmount.toString(0, true))
				);

				const formattedResult = wei(resultingAmount.toString(), SYNTH_DECIMALS, true);
				const formattedSmallTradeResult = wei(smallTradeResult.toString(), SYNTH_DECIMALS, true);

				const slippage =
					value.gt(0) && formattedResult.gt(0)
						? wei(1)
								.sub(formattedSmallTradeResult.div(smallAmount).div(formattedResult.div(value)))
								.abs()
						: wei(0);

				setEstimatedSlippage(slippage);
				setSwaps(tradeSwaps);

				isBase
					? setQuoteCurrencyAmount(formattedResult.toString())
					: setBaseCurrencyAmount(formattedResult.toString());
			}
		},
		[smartOrderRouter, quoteCurrencyAddress, baseCurrencyAddress]
	);

	const handleApprove = useCallback(async () => {
		if (gasPrice != null && balancerProxyContract != null) {
			try {
				const { contracts } = synthetixjs!;
				setIsApproving(true);
				setApproveError(null);
				setApproveModalOpen(true);
				const gasLimitEstimate = await contracts[`Synth${quoteCurrencyKey}`].estimateGas.approve(
					balancerProxyContract.address,
					ethers.constants.MaxUint256
				);
				const allowanceTx: ethers.ContractTransaction = await contracts[
					`Synth${quoteCurrencyKey}`
				].approve(balancerProxyContract.address, ethers.constants.MaxUint256, {
					gasPrice: gasPrice.toString(0, true),
					gasLimit: normalizeGasLimit(gasLimitEstimate.toNumber()),
				});
				if (allowanceTx && transactionNotifier) {
					const link =
						blockExplorerInstance != null
							? blockExplorerInstance.txLink(allowanceTx.hash)
							: undefined;

					monitorTransaction({
						txHash: allowanceTx.hash,
						onTxConfirmed: () => {
							getAllowanceAndInitProxyContract({
								address: walletAddress,
								key: quoteCurrencyKey,
								id: network?.id ?? null,
								contractNeedsInit: false,
							});
							return {
								autoDismiss: 0,
								link,
							};
						},
						onTxSent: () => {
							return {
								link,
							};
						},
						onTxFailed: () => {
							return {
								link,
							};
						},
					});
				}
			} catch (e) {
				console.log(e);
				setApproveError(e.message);
				setIsApproving(false);
			}
		}
	}, [
		gasPrice,
		balancerProxyContract,
		blockExplorerInstance,
		walletAddress,
		network?.id,
		getAllowanceAndInitProxyContract,
		transactionNotifier,
		monitorTransaction,
		quoteCurrencyKey,
		synthetixjs,
	]);

	const handleSubmit = useCallback(async () => {
		if (
			synthetixjs != null &&
			gasPrice != null &&
			balancerProxyContract?.address != null &&
			provider != null
		) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			try {
				setIsSubmitting(true);

				const slippageTolerance = wei(maxSlippageTolerance);

				const tx = await balancerProxyContract.multihopBatchSwapExactIn(
					swaps,
					quoteCurrencyAddress,
					baseCurrencyAddress,
					quoteCurrencyAmountBN.toString(0, true),
					baseCurrencyAmountBN.mul(wei(1).sub(slippageTolerance)).toString(0, true),
					{
						gasPrice: gasPrice.toString(0, true),
					}
				);

				if (tx) {
					setOrders((orders) =>
						produce(orders, (draftState) => {
							draftState.push({
								timestamp: Date.now(),
								hash: tx.hash,
								baseCurrencyKey: baseCurrencyKey!,
								baseCurrencyAmount,
								quoteCurrencyKey: quoteCurrencyKey!,
								quoteCurrencyAmount,
								orderType: 'market',
								status: 'pending',
								transaction: tx,
							});
						})
					);
					setHasOrdersNotification(true);

					if (transactionNotifier) {
						const link =
							blockExplorerInstance != null ? blockExplorerInstance.txLink(tx.hash) : undefined;
						monitorTransaction({
							txHash: tx.hash,
							onTxConfirmed: () => {
								setOrders((orders) =>
									produce(orders, (draftState) => {
										const orderIndex = orders.findIndex((order) => order.hash === tx.hash);
										if (draftState[orderIndex]) {
											draftState[orderIndex].status = 'confirmed';
										}
									})
								);
								synthsWalletBalancesQuery.refetch();
								return {
									autoDismiss: 0,
									link,
								};
							},
							onTxSent: () => {
								return {
									link,
								};
							},
							onTxFailed: () => {
								return {
									link,
								};
							},
						});
					}
				}
				setTxConfirmationModalOpen(false);
			} catch (e) {
				console.log(e);
				setTxError(e.message);
			} finally {
				setIsSubmitting(false);
			}
		}
	}, [
		gasPrice,
		balancerProxyContract,
		swaps,
		baseCurrencyAddress,
		quoteCurrencyAddress,
		baseCurrencyAmountBN,
		quoteCurrencyAmountBN,
		baseCurrencyAmount,
		baseCurrencyKey,
		quoteCurrencyAmount,
		quoteCurrencyKey,
		provider,
		transactionNotifier,
		monitorTransaction,
		blockExplorerInstance,
		synthsWalletBalancesQuery,
		setOrders,
		setHasOrdersNotification,
		maxSlippageTolerance,
		synthetixjs,
	]);

	const handleAmountChange = useCallback(
		({
			value,
			isBase,
			isMaxClick = false,
		}: {
			value: string;
			isBase: boolean;
			isMaxClick?: boolean;
		}) => {
			if (value === '' && !isMaxClick) {
				setBaseCurrencyAmount('');
				setQuoteCurrencyAmount('');
			} else if (isBase) {
				const baseAmount = isMaxClick ? (baseCurrencyBalance ?? 0).toString() : value;
				setBaseCurrencyAmount(baseAmount);
				calculateExchangeRate({ value: wei(baseAmount), isBase });
			} else {
				const quoteAmount = isMaxClick ? (quoteCurrencyBalance ?? 0).toString() : value;
				setQuoteCurrencyAmount(quoteAmount);
				calculateExchangeRate({ value: wei(quoteAmount), isBase });
			}
		},
		[baseCurrencyBalance, quoteCurrencyBalance, calculateExchangeRate]
	);

	const handleAmountChangeBase = useCallback(
		(value) => handleAmountChange({ value, isBase: true }),
		[handleAmountChange]
	);
	const handleAmountChangeQuote = useCallback(
		(value) => handleAmountChange({ value, isBase: false }),
		[handleAmountChange]
	);
	const handleAmountChangeBaseMaxClick = useCallback(
		() => handleAmountChange({ value: '', isBase: true, isMaxClick: true }),
		[handleAmountChange]
	);
	const handleAmountChangeQuoteMaxClick = useCallback(
		() => handleAmountChange({ value: '', isBase: false, isMaxClick: true }),
		[handleAmountChange]
	);

	const quoteCurrencyCard = (
		<StyledCurrencyCard
			side="quote"
			currencyKey={quoteCurrencyKey}
			amount={quoteCurrencyAmount}
			onAmountChange={handleAmountChangeQuote}
			walletBalance={quoteCurrencyBalance}
			onBalanceClick={handleAmountChangeQuoteMaxClick}
			onCurrencySelect={undefined}
			priceRate={quoteCurrencyKey === Synths.sUSD ? quotePriceRate : null}
			label={t('exchange.common.from')}
		/>
	);

	const baseCurrencyCard = (
		<StyledCurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			amount={baseCurrencyAmount}
			onAmountChange={handleAmountChangeBase}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={handleAmountChangeBaseMaxClick}
			onCurrencySelect={undefined}
			priceRate={baseCurrencyKey === Synths.sUSD ? basePriceRate : null}
			label={t('exchange.common.into')}
		/>
	);

	const footerCard = (
		<>
			{!isWalletConnected ? (
				<ConnectWalletCard attached={footerCardAttached} />
			) : showNoSynthsCard && noSynths ? (
				<NoSynthsCard attached={footerCardAttached} />
			) : (
				<TradeBalancerSummaryCard
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={isApproved ? handleSubmit : handleApprove}
					gasPrices={ethGasPriceQuery.data}
					estimatedSlippage={estimatedSlippage}
					maxSlippageTolerance={maxSlippageTolerance}
					setMaxSlippageTolerance={setMaxSlippageTolerance}
					isApproved={isApproved}
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
					totalTradePrice={totalTradePrice?.toString() || '0'}
					txProvider="balancer"
					quoteCurrencyLabel={t('exchange.common.from')}
					baseCurrencyLabel={t('exchange.common.into')}
					feeCost={feeAmountInBaseCurrency}
					icon={<Image src={ArrowsIcon} />}
				/>
			)}
			{approveModalOpen && (
				<BalancerApproveModal
					onDismiss={() => setApproveModalOpen(false)}
					synth={quoteCurrencyKey!}
					approveError={approveError}
				/>
			)}
		</>
	);

	return {
		quoteCurrencyCard,
		baseCurrencyCard,
		footerCard,
		handleCurrencySwap,
	};
};

const StyledCurrencyCard = styled(CurrencyCard)`
	align-items: center;
	margin-top: 2px;
`;

export default useBalancerExchange;
