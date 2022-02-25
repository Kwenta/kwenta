import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { useState } from 'react';
import { Synths } from 'constants/currency';

import Button from 'components/Button';
import { zeroBN } from 'utils/formatters/number';
import { PositionSide } from '../types';
import { useRecoilState } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';

import LeverageInput from '../LeverageInput';
import EditMarginModal from './EditMarginModal';
import TradeConfirmationModal from './TradeConfirmationModal';
import { useRouter } from 'next/router';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { gasPriceInWei } from 'utils/network';
import MarketsDropdown from './MarketsDropdown';
import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import { parseGasPriceObject } from 'hooks/useGas';

type TradeProps = {};

const DEFAULT_MAX_LEVERAGE = wei(10);

const Trade: React.FC<TradeProps> = () => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const {
		useExchangeRatesQuery,
		useSynthsBalancesQuery,
		useEthGasPriceQuery,
	} = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const router = useRouter();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthetixjs } = Connector.useContainer();

	const marketAsset = router.query.market?.[0] ?? null;
	const marketQuery = useGetFuturesMarkets();
	const market = marketQuery?.data?.find(({ asset }) => asset === marketAsset) ?? null;

	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const ethGasPriceQuery = useEthGasPriceQuery();

	const [error, setError] = useState<string | null>(null);
	const competitionClosed = true;

	const [leverage, setLeverage] = useState<number>(1);

	const [tradeSize, setTradeSize] = useState<string>('');
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [gasSpeed] = useRecoilState(gasSpeedState);
	const [feeCost, setFeeCost] = useState<Wei | null>(null);
	const [isLeverageValueCommitted, setIsLeverageValueCommitted] = useState<boolean>(true);

	const [isEditMarginModalOpen, setIsEditMarginModalOpen] = useState<boolean>(false);
	const [isTradeConfirmationModalOpen, setIsTradeConfirmationModalOpen] = useState<boolean>(false);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const gasPrices = useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const gasPrice = useMemo(
		() =>
			ethGasPriceQuery.isSuccess
				? ethGasPriceQuery?.data != null
					? parseGasPriceObject(ethGasPriceQuery.data[gasSpeed])
					: null
				: null,
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data, gasSpeed]
	);

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const marketAssetRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const positionLeverage = futuresMarketPositionQuery?.data?.position?.leverage ?? wei(0);
	const positionSide = futuresMarketPositionQuery?.data?.position?.side;
	const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

	const maxLeverageValue = useMemo(() => {
		if (!positionLeverage) return marketMaxLeverage;
		if (positionLeverage.eq(wei(0))) return marketMaxLeverage;
		if (positionSide === leverageSide) {
			return marketMaxLeverage?.sub(positionLeverage);
		} else {
			return positionLeverage.add(marketMaxLeverage);
		}
	}, [positionLeverage, positionSide, leverageSide, marketMaxLeverage]);

	const onTradeAmountChange = (value: string) => {
		setTradeSize(value);
		// We should probably compute this using Wei(). Problem is exchangeRates return numbers.
		setLeverage(
			(Number(value) * marketAssetRate) / Number(futuresMarketsPosition?.remainingMargin.toString())
		);
	};

	const onLeverageChange = (value: number) => {
		if (value < 0) {
			setLeverage(0);
			setTradeSize('');
		} else {
			setLeverage(value);
			const newTradeSize =
				marketAssetRate === 0
					? 0
					: (value * Number(futuresMarketsPosition?.remainingMargin?.toString() ?? 0)) /
					  marketAssetRate;

			setTradeSize(newTradeSize.toString());
		}
	};

	useEffect(() => {
		const getGasLimit = async () => {
			if (
				!synthetixjs ||
				!marketAsset ||
				!walletAddress ||
				!tradeSize ||
				Number(tradeSize) === 0 ||
				!isLeverageValueCommitted
			) {
				setGasLimit(null);
				return;
			}
			if (!futuresMarketsPosition || !futuresMarketsPosition.remainingMargin) return;
			try {
				setError(null);
				setGasLimit(null);
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const sizeDelta = wei(leverageSide === PositionSide.LONG ? tradeSize : -tradeSize);
				const [gasEstimate, orderFee] = await Promise.all([
					FuturesMarketContract.estimateGas.modifyPosition(sizeDelta.toBN()),
					FuturesMarketContract.orderFee(walletAddress, sizeDelta.toBN()),
				]);
				setGasLimit(Number(gasEstimate));
				setFeeCost(wei(orderFee.fee));
			} catch (e) {
				console.log(e);
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [
		tradeSize,
		synthetixjs,
		marketAsset,
		futuresMarketsPosition,
		leverageSide,
		walletAddress,
		isLeverageValueCommitted,
	]);

	const handleCreateOrder = async () => {
		if (!gasLimit || !tradeSize || !gasPrice) return;
		try {
			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
			const sizeDelta = wei(leverageSide === PositionSide.LONG ? tradeSize : -tradeSize);
			const tx = await FuturesMarketContract.modifyPosition(sizeDelta.toBN(), {
				gasLimit,
				gasPrice: gasPriceInWei(gasPrice),
			});
			if (tx) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						onLeverageChange(0);
						setTimeout(() => {
							futuresMarketPositionQuery.refetch();
							futuresPositionHistoryQuery.refetch();
						}, 5 * 1000);
					},
				});
			}
		} catch (e) {
			console.log(e);
			setError(e?.data?.message ?? e.message);
		}
	};

	return (
		<Panel>
			<MarketsDropdown asset={marketAsset || Synths.sUSD} />
			<MarketActions>
				<MarketActionButton onClick={() => setIsEditMarginModalOpen(true)}>
					Deposit
				</MarketActionButton>
				<MarketActionButton onClick={() => setIsEditMarginModalOpen(true)}>
					Withdraw
				</MarketActionButton>
			</MarketActions>

			<MarketInfoBox
				availableMargin={futuresMarketsPosition?.remainingMargin ?? zeroBN}
				buyingPower={sUSDBalance}
				liquidationPrice={futuresMarketsPosition?.position?.liquidationPrice ?? zeroBN}
				leverage={futuresMarketsPosition?.position?.leverage ?? zeroBN}
			/>

			<StyledSegmentedControl values={['Market', 'Limit']} selectedIndex={0} onChange={() => {}} />

			<OrderSizing
				amount={tradeSize}
				assetRate={marketAssetRate}
				onAmountChange={(value) => onTradeAmountChange(value)}
				marketAsset={marketAsset || Synths.sUSD}
			/>

			<PositionButtons
				selected={leverageSide}
				onSelect={(position) => {
					onLeverageChange(0);
					setLeverageSide(position);
				}}
			/>

			<LeverageInput
				currentLeverage={leverage}
				maxLeverage={maxLeverageValue.toNumber()}
				onLeverageChange={(value) => onLeverageChange(value)}
				side={leverageSide}
				setIsLeverageValueCommitted={setIsLeverageValueCommitted}
				currentPosition={futuresMarketsPosition}
				assetRate={marketAssetRate}
				currentTradeSize={tradeSize ? Number(tradeSize) : 0}
			/>

			<PlaceOrderButton fullWidth>Place Market Order</PlaceOrderButton>

			<FeeInfoBox transactionFee={transactionFee} feeCost={feeCost} />

			{/* <FlexDivCol>
					<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
				</FlexDivCol> */}
			{isEditMarginModalOpen && (
				<EditMarginModal
					sUSDBalance={sUSDBalance}
					accessibleMargin={futuresMarketsPosition?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							futuresMarketPositionQuery.refetch();
							futuresPositionHistoryQuery.refetch();
							synthsBalancesQuery.refetch();
						}, 5 * 1000);
					}}
					market={marketAsset}
					onDismiss={() => setIsEditMarginModalOpen(false)}
				/>
			)}
			{isTradeConfirmationModalOpen && (
				<TradeConfirmationModal
					tradeSize={tradeSize}
					onConfirmOrder={handleCreateOrder}
					gasLimit={gasLimit}
					market={marketAsset}
					side={leverageSide}
					onDismiss={() => setIsTradeConfirmationModalOpen(false)}
				/>
			)}
		</Panel>
	);
};
export default Trade;

const Panel = styled.div`
	height: 100%;
	padding-bottom: 48px;
`;

const MarketActions = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
	margin-bottom: 16px;
`;

const MarketActionButton = styled(Button)`
	font-size: 15px;
`;

const PlaceOrderButton = styled(Button)`
	margin-bottom: 16px;
	height: 55px;
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;
