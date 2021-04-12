import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';
import { SOR } from '@balancer-labs/sor';
import { BigNumber } from 'bignumber.js';
import { NetworkId } from '@synthetixio/js';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import ArrowsIcon from 'assets/svg/app/circle-arrows.svg';

import { CurrencyKey, SYNTHS_MAP, sUSD_EXCHANGE_RATE, SYNTH_DECIMALS } from 'constants/currency';
import useInterval from 'hooks/useInterval';

import Connector from 'containers/Connector';
import Etherscan from 'containers/Etherscan';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useEthGasPriceQuery from 'queries/network/useEthGasPriceQuery';

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
	networkState,
} from 'store/wallet';
import { ordersState } from 'store/orders';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import synthetix from 'lib/synthetix';

import useFeeReclaimPeriodQuery from 'queries/synths/useFeeReclaimPeriodQuery';
import { gasPriceInWei, normalizeGasLimit } from 'utils/network';
import useCurrencyPair from './useCurrencyPair';
import { toBigNumber, zeroBN, scale } from 'utils/formatters/number';

import balancerExchangeProxyABI from './balancerExchangeProxyABI';

type ExchangeCardProps = {
	defaultBaseCurrencyKey?: CurrencyKey | null;
	defaultQuoteCurrencyKey?: CurrencyKey | null;
	footerCardAttached?: boolean;
	persistSelectedCurrencies?: boolean;
	showNoSynthsCard?: boolean;
};

const BALANCER_LINKS = {
	[NetworkId.Mainnet]: {
		poolsUrl:
			'https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange/pools',
		proxyAddr: '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21', // Balancer Mainnet proxy
	},
	[NetworkId.Kovan]: {
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
	const { notify, provider, signer } = Connector.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();
	const network = useRecoilValue(networkState);

	const [currencyPair, setCurrencyPair] = useCurrencyPair({
		persistSelectedCurrencies,
		defaultBaseCurrencyKey,
		defaultQuoteCurrencyKey,
	});
	const [hasSetCostOutputTokenCalled, setHasSetCostOutputTokenCalled] = useState<boolean>(false);
	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('0');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('0');
	const [baseCurrencyAddress, setBaseCurrencyAddress] = useState<string | null>(null);
	const [quoteCurrencyAddress, setQuoteCurrencyAddress] = useState<string | null>(null);
	const [smartOrderRouter, setSmartOrderRouter] = useState<SOR | null>(null);
	const [balancerProxyContract, setBalancerProxyContract] = useState<ethers.Contract | null>(null);
	const [approveError, setApproveError] = useState<string | null>(null);
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [baseAllowance, setBaseAllowance] = useState<string | null>(null);
	const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
	const [maxSlippageTolerance, setMaxSlippageTolerance] = useState<string>('0');
	const [estimatedSlippage, setEstimatedSlippage] = useState<BigNumber>(new BigNumber(0));

	const [swaps, setSwaps] = useState<Array<any> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const walletAddress = useRecoilValue(walletAddressState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<string | null>(null);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	// TODO get from pool
	const exchangeFeeRate = 0.001;

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey);
	const { selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.isSuccess
		? feeReclaimPeriodQuery.data ?? 0
		: 0;

	const baseCurrencyBalance =
		baseCurrencyKey != null && synthsWalletBalancesQuery.isSuccess
			? get(synthsWalletBalancesQuery.data, ['balancesMap', baseCurrencyKey, 'balance'], zeroBN)
			: null;

	let quoteCurrencyBalance: BigNumber | null = null;
	if (quoteCurrencyKey != null) {
		quoteCurrencyBalance = synthsWalletBalancesQuery.isSuccess
			? get(synthsWalletBalancesQuery.data, ['balancesMap', quoteCurrencyKey, 'balance'], zeroBN)
			: null;
	}

	const baseCurrencyAmountBN = toBigNumber(baseCurrencyAmount !== '' ? baseCurrencyAmount : 0);
	const quoteCurrencyAmountBN = toBigNumber(quoteCurrencyAmount !== '' ? quoteCurrencyAmount : 0);

	const selectedBothSides = baseCurrencyKey != null && quoteCurrencyKey != null;

	const basePriceRate =
		baseCurrencyKey === SYNTHS_MAP.sUSD
			? sUSD_EXCHANGE_RATE
			: baseCurrencyAmountBN.div(quoteCurrencyAmountBN).toNumber();
	const quotePriceRate =
		quoteCurrencyKey === SYNTHS_MAP.sUSD
			? sUSD_EXCHANGE_RATE
			: quoteCurrencyAmountBN.div(baseCurrencyAmountBN).toNumber();

	let totalTradePrice =
		baseCurrencyKey === SYNTHS_MAP.sUSD
			? baseCurrencyAmountBN.multipliedBy(basePriceRate)
			: quoteCurrencyAmountBN.multipliedBy(quotePriceRate);
	if (selectPriceCurrencyRate) {
		totalTradePrice = totalTradePrice.dividedBy(selectPriceCurrencyRate);
	}

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
		if (
			!isWalletConnected ||
			baseCurrencyAmountBN.isNaN() ||
			quoteCurrencyAmountBN.isNaN() ||
			baseCurrencyAmountBN.lte(0) ||
			quoteCurrencyAmountBN.lte(0)
		) {
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
				? Number(customGasPrice)
				: ethGasPriceQuery.data != null
				? ethGasPriceQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed]
	);

	const feeAmountInBaseCurrency = useMemo(() => {
		if (exchangeFeeRate != null && baseCurrencyAmount) {
			return toBigNumber(baseCurrencyAmount).multipliedBy(exchangeFeeRate);
		}
		return null;
	}, [baseCurrencyAmount, exchangeFeeRate]);

	useEffect(() => {
		if (
			synthetix?.js != null &&
			provider != null &&
			gasPrice != null &&
			network?.id != null &&
			(network.id === NetworkId.Mainnet || network.id === NetworkId.Kovan)
		) {
			const maxNoPools = 1;
			const sor = new SOR(
				provider as ethers.providers.BaseProvider,
				new BigNumber(gasPrice),
				maxNoPools,
				network?.id,
				BALANCER_LINKS[network.id].poolsUrl
			);
			sor.fetchPools();
			setSmartOrderRouter(sor);
		}
	}, [provider, gasPrice, network?.id]);

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
				synthetix?.js != null &&
				signer != null &&
				id != null &&
				(id === NetworkId.Mainnet || id === NetworkId.Kovan)
			) {
				if (contractNeedsInit) {
					const proxyContract = new ethers.Contract(
						BALANCER_LINKS[id].proxyAddr,
						balancerExchangeProxyABI,
						signer
					);
					setBalancerProxyContract(proxyContract);
				}
				const allowance = await synthetix.js.contracts[`Synth${key}`].allowance(
					address,
					BALANCER_LINKS[id].proxyAddr
				);
				setBaseAllowance(allowance.toString());
			}
		},
		[signer]
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
		if (synthetix?.js && baseCurrencyKey != null && quoteCurrencyKey != null) {
			setBaseCurrencyAddress(synthetix.js.contracts[`Synth${baseCurrencyKey}`].address);
			setQuoteCurrencyAddress(synthetix.js.contracts[`Synth${quoteCurrencyKey}`].address);
		}
	}, [baseCurrencyKey, quoteCurrencyKey]);

	const calculateExchangeRate = useCallback(
		async ({ value, isBase }: { value: BigNumber; isBase: boolean }) => {
			if (smartOrderRouter != null && quoteCurrencyAddress != null && baseCurrencyAddress != null) {
				const swapType = isBase ? 'swapExactOut' : 'swapExactIn';
				const amount = scale(value, SYNTH_DECIMALS);
				const smallBN = new BigNumber(0.001);
				const smallAmount = scale(new BigNumber(0.001), SYNTH_DECIMALS);
				const [tradeSwaps, resultingAmount] = await smartOrderRouter.getSwaps(
					quoteCurrencyAddress,
					baseCurrencyAddress,
					swapType,
					amount
				);

				const [, smallTradeResult] = await smartOrderRouter.getSwaps(
					quoteCurrencyAddress,
					baseCurrencyAddress,
					swapType,
					smallAmount
				);

				const formattedResult = scale(resultingAmount, SYNTH_DECIMALS, true);
				const formattedSmallTradeResult = scale(smallTradeResult, SYNTH_DECIMALS, true);

				const slippage = new BigNumber(1)
					.minus(formattedSmallTradeResult.div(smallBN).div(formattedResult.div(value)))
					.abs();

				setEstimatedSlippage(slippage.isNaN() ? new BigNumber(0) : slippage);
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
				const { contracts } = synthetix.js!;
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
					gasPrice: gasPriceInWei(gasPrice),
					gasLimit: normalizeGasLimit(gasLimitEstimate.toNumber()),
				});
				if (allowanceTx && notify) {
					const { emitter } = notify.hash(allowanceTx.hash);
					const link =
						etherscanInstance != null ? etherscanInstance.txLink(allowanceTx.hash) : undefined;

					emitter.on('txConfirmed', () => {
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
					});

					emitter.on('all', () => {
						return {
							link,
						};
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
		etherscanInstance,
		walletAddress,
		network?.id,
		getAllowanceAndInitProxyContract,
		notify,
		quoteCurrencyKey,
	]);

	const handleSubmit = useCallback(async () => {
		if (
			synthetix.js != null &&
			gasPrice != null &&
			balancerProxyContract?.address != null &&
			provider != null
		) {
			setTxError(null);
			setTxConfirmationModalOpen(true);

			try {
				setIsSubmitting(true);

				const gasPriceWei = gasPriceInWei(gasPrice);
				const slippageTolerance = new BigNumber(maxSlippageTolerance);

				const tx = await balancerProxyContract.multihopBatchSwapExactIn(
					swaps,
					quoteCurrencyAddress,
					baseCurrencyAddress,
					scale(quoteCurrencyAmountBN, SYNTH_DECIMALS).toString(),
					scale(baseCurrencyAmountBN, SYNTH_DECIMALS)
						.times(new BigNumber(1).minus(slippageTolerance))
						.toString(),
					{
						gasPrice: gasPriceWei.toString(),
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

					if (notify) {
						const { emitter } = notify.hash(tx.hash);
						const link = etherscanInstance != null ? etherscanInstance.txLink(tx.hash) : undefined;
						// TODO: replace with monitorHash
						emitter.on('txConfirmed', () => {
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
						});

						emitter.on('all', () => {
							return {
								link,
							};
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
		notify,
		etherscanInstance,
		synthsWalletBalancesQuery,
		setOrders,
		setHasOrdersNotification,
		maxSlippageTolerance,
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
				calculateExchangeRate({ value: new BigNumber(baseAmount), isBase });
			} else {
				const quoteAmount = isMaxClick ? (quoteCurrencyBalance ?? 0).toString() : value;
				setQuoteCurrencyAmount(quoteAmount);
				calculateExchangeRate({ value: new BigNumber(quoteAmount), isBase });
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
			priceRate={quoteCurrencyKey === SYNTHS_MAP.sUSD ? quotePriceRate : null}
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
			priceRate={baseCurrencyKey === SYNTHS_MAP.sUSD ? basePriceRate : null}
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
					feeAmountInBaseCurrency={feeAmountInBaseCurrency}
					baseCurrencyKey={baseCurrencyKey!}
					quoteCurrencyKey={quoteCurrencyKey!}
					totalTradePrice={totalTradePrice.toString()}
					txProvider="balancer"
					quoteCurrencyLabel={t('exchange.common.from')}
					baseCurrencyLabel={t('exchange.common.into')}
					icon={<Svg src={ArrowsIcon} />}
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
