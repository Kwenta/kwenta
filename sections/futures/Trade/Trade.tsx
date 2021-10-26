import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { FlexDivCol, FlexDivRow, FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import { useState } from 'react';
import { Synths } from 'constants/currency';

import Button from 'components/Button';
import { zeroBN, formatCurrency } from 'utils/formatters/number';
import { PositionSide } from '../types';
import { useRecoilState } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTransactionPrice } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';

import TradeSizeInput from '../TradeSizeInput';
import LeverageInput from '../LeverageInput';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import FeeCostSummary from 'sections/shared/components/FeeCostSummary';
import MarginSection from './MarginSection';
import EditMarginModal from './EditMarginModal';
import TradeConfirmationModal from './TradeConfirmationModal';
import { useRouter } from 'next/router';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { gasPriceInWei } from 'utils/network';
import MarketsDropdown from './MarketsDropdown';

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

	const [leverage, setLeverage] = useState<number>(0);

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
					? ethGasPriceQuery.data[gasSpeed]
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
			<TopRow>
				<FlexDivRow>
					<Title>{t('futures.market.trade.market')}</Title>
				</FlexDivRow>
				<MarketsDropdown asset={marketAsset || Synths.sUSD} />
				<FlexDivRow>
					<Title>{t('futures.market.trade.title')}</Title>
				</FlexDivRow>
				<TradeSizeInput
					amount={tradeSize}
					assetRate={marketAssetRate}
					onAmountChange={(value) => onTradeAmountChange(value)}
					balance={futuresMarketsPosition?.remainingMargin ?? zeroBN}
					asset={marketAsset || Synths.sUSD}
					handleOnMax={() => onLeverageChange(maxLeverageValue.toNumber())}
					balanceLabel={t('futures.market.trade.input.remaining-margin')}
				/>

				<LeverageInput
					currentLeverage={leverage}
					maxLeverage={maxLeverageValue.toNumber()}
					onSideChange={(side) => {
						onLeverageChange(0);
						setLeverageSide(side);
					}}
					onLeverageChange={(value) => onLeverageChange(value)}
					side={leverageSide}
					setIsLeverageValueCommitted={setIsLeverageValueCommitted}
					currentPosition={futuresMarketsPosition}
					assetRate={marketAssetRate}
					currentTradeSize={tradeSize ? Number(tradeSize) : 0}
				/>

				<FlexDivCol>
					<StyledFeeCostSummary feeCost={feeCost} />
					<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
					{futuresMarketsPosition && futuresMarketsPosition.remainingMargin.gt(zeroBN) ? (
						<StyledButton
							variant="primary"
							disabled={!gasLimit || !!error || !tradeSize || competitionClosed}
							isRounded
							size="lg"
							onClick={() => setIsTradeConfirmationModalOpen(true)}
						>
							{competitionClosed
								? t('futures.market.trade.button.competition-closed')
								: error
								? error
								: tradeSize
								? t('futures.market.trade.button.open-trade')
								: t('futures.market.trade.button.enter-amount')}
						</StyledButton>
					) : (
						<CTAMargin>
							<MarginTitle>{t('futures.market.trade.margin.deposit-susd')}</MarginTitle>
							<MarginSubTitle>
								{t('futures.market.trade.margin.min-initial-margin', {
									minInitialMargin: formatCurrency(Synths.sUSD, market?.minInitialMargin ?? 0, {
										currencyKey: Synths.sUSD,
										minDecimals: 0,
									}),
								})}
							</MarginSubTitle>
							<DepositMarginButton
								variant="primary"
								isRounded
								size="lg"
								onClick={() => setIsEditMarginModalOpen(true)}
							>
								{t('futures.market.trade.button.deposit-margin')}
							</DepositMarginButton>
						</CTAMargin>
					)}
				</FlexDivCol>
			</TopRow>
			<MarginSection
				remainingMargin={futuresMarketsPosition?.remainingMargin ?? zeroBN}
				sUSDBalance={sUSDBalance}
				onDeposit={() => setIsEditMarginModalOpen(true)}
			/>
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

const Title = styled.div`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	text-transform: capitalize;
`;

const StyledGasPriceSelect = styled(GasPriceSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const StyledFeeCostSummary = styled(FeeCostSummary)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 8px;
`;

const StyledButton = styled(Button)`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

const TopRow = styled(FlexDivCol)`
	margin-top: 12px;
`;

const Panel = styled(FlexDivCol)`
	height: 100%;
	justify-content: space-between;
	padding-bottom: 48px;
`;

const CTAMargin = styled(FlexDivColCentered)`
	margin-top: 40px;
`;

const MarginTitle = styled.h3`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	margin: 0;
`;

const MarginSubTitle = styled.h4`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	margin: 5px 0 10px 0;
`;

const DepositMarginButton = styled(Button)`
	width: 100%;
`;
