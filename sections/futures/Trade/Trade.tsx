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
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';

import LeverageInput from '../LeverageInput';
// import EditMarginModal from './EditMarginModal';
import TradeConfirmationModal from './TradeConfirmationModal';
import { useRouter } from 'next/router';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { gasPriceInWei, normalizeGasLimit } from 'utils/network';
import MarketsDropdown from './MarketsDropdown';
// import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import { parseGasPriceObject } from 'hooks/useGas';
import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';

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

	const [leverage, setLeverage] = useState<string>('');

	const [tradeSize, setTradeSize] = useState('');
	const [tradeSizeSUSD, setTradeSizeSUSD] = useState('');
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [gasSpeed] = useRecoilState(gasSpeedState);
	const [feeCost, setFeeCost] = useState<Wei | null>(null);
	const [isLeverageValueCommitted, setIsLeverageValueCommitted] = useState<boolean>(true);

	const [isDepositMarginModalOpen, setIsDepositMarginModalOpen] = useState(false);
	const [isWithdrawMarginModalOpen, setIsWithdrawMarginModalOpen] = useState(false);
	const [isTradeConfirmationModalOpen, setIsTradeConfirmationModalOpen] = useState<boolean>(false);

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

	const marketAssetRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

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
		setTradeSizeSUSD(value === '' ? '' : (Number(value) * marketAssetRate).toString());
	};

	useEffect(() => {
		// We should probably compute this using Wei(). Problem is exchangeRates return numbers.
		if (
			Number(tradeSize) &&
			Number(marketAssetRate) &&
			Number(futuresMarketsPosition?.remainingMargin.toString())
		) {
			setLeverage(
				(
					(Number(tradeSize) * marketAssetRate) /
					Number(futuresMarketsPosition?.remainingMargin.toString())
				).toString()
			);
		} else {
			if (Number(leverage) !== 0) {
				setLeverage('');
			}
		}
	}, [tradeSize, marketAssetRate, futuresMarketsPosition, leverage]);

	const onTradeAmountSUSDChange = (value: string) => {
		setTradeSizeSUSD(value);
		setTradeSize(value === '' ? '' : (Number(value) / marketAssetRate).toString());
	};

	const onLeverageChange = (value: string) => {
		if (value === '' || Number(value) < 0) {
			setLeverage('');
			setTradeSize('');
			setTradeSizeSUSD('');
		} else {
			setLeverage(value);
			const newTradeSize =
				marketAssetRate === 0
					? 0
					: (Number(value) * Number(futuresMarketsPosition?.remainingMargin?.toString() ?? 0)) /
					  marketAssetRate;

			onTradeAmountChange(newTradeSize.toString());
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
					FuturesMarketContract.orderFee(sizeDelta.toBN()),
				]);
				setGasLimit(normalizeGasLimit(gasEstimate.toNumber()));
				setFeeCost(wei(orderFee.fee));
			} catch (e) {
				console.log(e);
				// @ts-ignore
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
						onLeverageChange('');
						setTimeout(() => {
							futuresMarketPositionQuery.refetch();
							futuresPositionHistoryQuery.refetch();
						}, 5 * 1000);
					},
				});
			}
		} catch (e) {
			console.log(e);
			// @ts-ignore
			setError(e?.data?.message ?? e.message);
		}
	};

	return (
		<Panel>
			<MarketsDropdown asset={marketAsset || Synths.sUSD} />
			<MarketActions>
				<MarketActionButton onClick={() => setIsDepositMarginModalOpen(true)}>
					Deposit
				</MarketActionButton>
				<MarketActionButton onClick={() => setIsWithdrawMarginModalOpen(true)}>
					Withdraw
				</MarketActionButton>
			</MarketActions>

			<MarketInfoBox
				totalMargin={futuresMarketsPosition?.remainingMargin ?? zeroBN}
				availableMargin={futuresMarketsPosition?.accessibleMargin ?? zeroBN}
				buyingPower={
					futuresMarketsPosition && futuresMarketsPosition?.remainingMargin.gt(zeroBN)
						? futuresMarketsPosition?.remainingMargin?.mul(market?.maxLeverage ?? zeroBN)
						: zeroBN
				}
				marginUsage={
					futuresMarketsPosition && futuresMarketsPosition?.remainingMargin.gt(zeroBN)
						? futuresMarketsPosition?.remainingMargin
								?.sub(futuresMarketsPosition?.accessibleMargin)
								.div(futuresMarketsPosition?.remainingMargin)
						: zeroBN
				}
				liquidationPrice={futuresMarketsPosition?.position?.liquidationPrice ?? zeroBN}
				leverage={futuresMarketsPosition?.position?.leverage ?? zeroBN}
			/>

			{/* <StyledSegmentedControl values={['Market', 'Limit']} selectedIndex={0} onChange={() => {}} /> */}

			<PositionButtons
				selected={leverageSide}
				onSelect={(position) => {
					onLeverageChange('');
					setLeverageSide(position);
				}}
			/>

			<OrderSizing
				amount={tradeSize}
				amountSUSD={tradeSizeSUSD}
				assetRate={marketAssetRate}
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				marketAsset={marketAsset || Synths.sUSD}
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

			<PlaceOrderButton
				variant="primary"
				fullWidth
				disabled={
					!leverage ||
					Number(leverage) < 0 ||
					Number(leverage) > maxLeverageValue.toNumber() ||
					(futuresMarketsPosition?.accessibleMargin ?? zeroBN).lt(wei(100))
				}
				onClick={() => {
					setIsTradeConfirmationModalOpen(true);
				}}
			>
				{futuresMarketsPosition?.position ? 'Modify Position' : 'Open Position'}
			</PlaceOrderButton>

			{error && <ErrorMessage>{error}</ErrorMessage>}

			<FeeInfoBox feeCost={feeCost} />

			{isDepositMarginModalOpen && (
				<DepositMarginModal
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
					onDismiss={() => setIsDepositMarginModalOpen(false)}
				/>
			)}

			{isWithdrawMarginModalOpen && (
				<WithdrawMarginModal
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
					onDismiss={() => setIsWithdrawMarginModalOpen(false)}
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

const ErrorMessage = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	margin-bottom: 16px;
`;

// const StyledSegmentedControl = styled(SegmentedControl)`
// 	margin-bottom: 16px;
// `;
