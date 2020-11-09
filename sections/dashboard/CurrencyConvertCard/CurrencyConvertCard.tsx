import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import get from 'lodash/get';
import produce from 'immer';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import { GWEI_UNIT } from 'constants/network';

import Connector from 'containers/Connector';
import OneInch from 'containers/OneInch';
import Etherscan from 'containers/Etherscan';

import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useETHBalanceQuery from 'queries/walletBalances/useETHBalanceQuery';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import CurrencyCard from 'sections/exchange/TradeCard/CurrencyCard';
import TradeSummaryCard, {
	SubmissionDisabledReason,
} from 'sections/exchange/FooterCard/TradeSummaryCard';
import ConnectWalletCard from 'sections/exchange/FooterCard/ConnectWalletCard';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { hasOrdersNotificationState } from 'store/ui';
import { customGasPriceState, gasSpeedState, isWalletConnectedState } from 'store/wallet';
import { ordersState } from 'store/orders';

import { getExchangeRatesForCurrencies } from 'utils/currencies';

import media from 'styles/media';

import synthetix from 'lib/synthetix';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

// TOOD: the convert/exchange currency cards are very similar, it needs to be refactored into a reusable component.

const CurrencyConvertCard: FC = () => {
	const { notify } = Connector.useContainer();
	const { swap } = OneInch.useContainer();
	const { etherscanInstance } = Etherscan.useContainer();

	const [currencyPair] = useState<{
		base: CurrencyKey | null;
		quote: CurrencyKey | null;
	}>({
		base: SYNTHS_MAP.sUSD,
		quote: SYNTHS_MAP.sETH,
	});

	const [baseCurrencyAmount, setBaseCurrencyAmount] = useState<string>('');
	const [quoteCurrencyAmount, setQuoteCurrencyAmount] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [txConfirmationModalOpen, setTxConfirmationModalOpen] = useState<boolean>(false);
	const [txError, setTxError] = useState<boolean>(false);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const { base: baseCurrencyKey, quote: quoteCurrencyKey } = currencyPair;

	const ETHBalanceQuery = useETHBalanceQuery();
	const ethGasStationQuery = useEthGasStationQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const exchangeRates = exchangeRatesQuery.data ?? null;

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const baseCurrency =
		baseCurrencyKey != null && synthetix.synthsMap != null
			? synthetix.synthsMap[baseCurrencyKey]
			: null;

	const rate = getExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey);
	const inverseRate = rate > 0 ? 1 / rate : 0;
	const baseCurrencyBalance =
		baseCurrencyKey != null && synthBalances != null
			? get(synthBalances, ['balancesMap', baseCurrencyKey, 'balance'], 0)
			: null;
	const quoteCurrencyBalance =
		quoteCurrencyKey != null && ETHBalanceQuery.isSuccess
			? get(ETHBalanceQuery.data, 'balance', 0)
			: null;
	const basePriceRate = getExchangeRatesForCurrencies(
		exchangeRates,
		baseCurrencyKey,
		selectedPriceCurrency.name
	);
	const quotePriceRate = getExchangeRatesForCurrencies(
		exchangeRates,
		quoteCurrencyKey,
		selectedPriceCurrency.name
	);
	const baseCurrencyAmountNum = Number(baseCurrencyAmount);
	const quoteCurrencyAmountNum = Number(quoteCurrencyAmount);

	let totalTradePrice = baseCurrencyAmountNum * basePriceRate;
	if (selectPriceCurrencyRate) {
		totalTradePrice /= selectPriceCurrencyRate;
	}

	const insufficientBalance = quoteCurrencyAmountNum > Number(quoteCurrencyBalance);
	const selectedBothSides = baseCurrencyKey != null && quoteCurrencyKey != null;

	const submissionDisabledReason: SubmissionDisabledReason | null = useMemo(() => {
		if (!selectedBothSides) {
			return 'select-synth';
		}
		if (insufficientBalance) {
			return 'insufficient-balance';
		}
		if (isSubmitting) {
			return 'submitting-order';
		}
		if (!isWalletConnected || !baseCurrencyAmountNum || !quoteCurrencyAmountNum) {
			return 'enter-amount';
		}
		return null;
	}, [
		selectedBothSides,
		insufficientBalance,
		isSubmitting,
		baseCurrencyAmountNum,
		quoteCurrencyAmountNum,
		isWalletConnected,
	]);

	const handleSubmit = async () => {
		setTxError(false);
		setTxConfirmationModalOpen(true);

		try {
			setIsSubmitting(true);
			const gasPrice =
				customGasPrice !== '' ? Number(customGasPrice) : ethGasStationQuery.data![gasSpeed];

			const tx = await swap(quoteCurrencyAmount, gasPrice * GWEI_UNIT);

			if (tx) {
				setOrders((orders) =>
					produce(orders, (draftState) => {
						draftState.push({
							timestamp: Date.now(),
							hash: tx.hash,
							baseCurrencyKey: baseCurrencyKey!,
							baseCurrencyAmount,
							quoteCurrencyKey: CRYPTO_CURRENCY_MAP.ETH,
							quoteCurrencyAmount,
							orderType: 'market',
							status: 'pending',
							transaction: tx,
						});
					})
				);
				setHasOrdersNotification(true);

				if (notify) {
					// TODO: move this to a shared function

					const { emitter } = notify.hash(tx.hash);
					const link = etherscanInstance != null ? etherscanInstance.txLink(tx.hash) : undefined;

					emitter.on('txConfirmed', () => {
						setOrders((orders) =>
							produce(orders, (draftState) => {
								const orderIndex = orders.findIndex((order) => order.hash === tx.hash);
								if (draftState[orderIndex]) {
									draftState[orderIndex].status = 'confirmed';
								}
							})
						);
						ETHBalanceQuery.refetch();
						synthsBalancesQuery.refetch();
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
			setTxError(true);
		} finally {
			setIsSubmitting(false);
		}
	};

	const quoteCurrencyCard = (
		<StyledCurrencyCard
			side="quote"
			currencyKey={CRYPTO_CURRENCY_MAP.ETH}
			amount={quoteCurrencyAmount}
			onAmountChange={(value) => {
				if (value === '') {
					setQuoteCurrencyAmount('');
					setBaseCurrencyAmount('');
				} else {
					const numValue = Number(value);

					setQuoteCurrencyAmount(value);
					setBaseCurrencyAmount(`${numValue * rate}`);
				}
			}}
			walletBalance={quoteCurrencyBalance}
			onBalanceClick={() => {
				setQuoteCurrencyAmount(`${quoteCurrencyBalance}`);
				setBaseCurrencyAmount(`${Number(quoteCurrencyBalance) * rate}`);
			}}
			priceRate={quotePriceRate}
		/>
	);

	const baseCurrencyCard = (
		<StyledCurrencyCard
			side="base"
			currencyKey={baseCurrencyKey}
			amount={baseCurrencyAmount}
			onAmountChange={(value) => {
				if (value === '') {
					setBaseCurrencyAmount('');
					setQuoteCurrencyAmount('');
				} else {
					const numValue = Number(value);

					setBaseCurrencyAmount(value);
					setQuoteCurrencyAmount(`${numValue * inverseRate}`);
				}
			}}
			walletBalance={baseCurrencyBalance}
			onBalanceClick={() => {
				setBaseCurrencyAmount(`${baseCurrencyBalance}`);
				setQuoteCurrencyAmount(`${Number(baseCurrencyBalance) * inverseRate}`);
			}}
			priceRate={basePriceRate}
		/>
	);

	return (
		<>
			<Container>
				{quoteCurrencyCard}
				{baseCurrencyCard}
			</Container>
			{!isWalletConnected ? (
				<StyledConnectWalletCard attached={true} />
			) : (
				<StyledTradeSummaryCard
					submissionDisabledReason={submissionDisabledReason}
					onSubmit={handleSubmit}
					totalTradePrice={totalTradePrice}
					baseCurrencyAmount={baseCurrencyAmount}
					basePriceRate={basePriceRate}
					baseCurrency={baseCurrency}
					gasPrices={ethGasStationQuery.data}
					feeReclaimPeriodInSeconds={0}
					quoteCurrencyKey={quoteCurrencyKey}
					showFee={false}
					attached={true}
					exchangeFeeRate={null}
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
					quoteCurrencyKey={CRYPTO_CURRENCY_MAP.ETH}
					totalTradePrice={totalTradePrice}
					txProvider="1inch"
				/>
			)}
		</>
	);
};

const Container = styled.div`
	display: grid;
	grid-template-columns: auto auto;
	grid-gap: 2px;
	padding-bottom: 2px;
	width: 100%;
	margin: 0 auto;
	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: auto auto;
		padding-bottom: 24px;
	`}
`;

const StyledCurrencyCard = styled(CurrencyCard)`
	padding: 0 14px;
	width: 100%;
`;

const StyledConnectWalletCard = styled(ConnectWalletCard)`
	max-width: 1000px;
`;

const StyledTradeSummaryCard = styled(TradeSummaryCard)`
	max-width: 1000px;
`;

export default CurrencyConvertCard;
