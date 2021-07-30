import React, { useMemo, useEffect } from 'react';
import { Contract } from 'ethers';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';

import { FlexDivCol, FlexDivRow, FlexDivColCentered } from 'styles/common';
import { TabButton, TabList } from 'components/Tab';
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

import TradeSizeInput from '../TradeSizeInput';
import LeverageInput from '../LeverageInput';
import GasPriceSelect from 'sections/shared/components/GasPriceSelect';
import FeeRateSummary from 'sections/shared/components/FeeRateSummary';
import FeeCostSummary from 'sections/shared/components/FeeCostSummary';
import SlippageSelect from 'sections/shared/components/SlippageSelect';
import MarginSection from './MarginSection';
import DepositMarginModal from './DepositMarginModal';
import { useRouter } from 'next/router';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import { getFuturesMarketContract } from 'queries/futures/utils';

type TradeProps = {};

enum TradeTab {
	BUY = 'BUY',
	SELL = 'SELL',
}

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

	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	// console.log('POSITION', futuresMarketsPosition);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const ethGasPriceQuery = useEthGasPriceQuery();

	const [activeTab, setActiveTab] = useState<TradeTab>(TradeTab.BUY);
	const [error, setError] = useState<string | null>(null);
	const [leverage, setLeverage] = useState<number>(1);
	const [tradeSize, setTradeSize] = useState<string>('');
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [gasSpeed] = useRecoilState(gasSpeedState);
	const [maxSlippageTolerance, setMaxSlippageTolerance] = useState<string>('0.005');

	const [isDepositMarginModalOpen, setIsDepositMarginModalOpen] = useState<boolean>(false);

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

	const TABS = [
		{
			name: TradeTab.BUY,
			label: t('futures.market.trade.input.buy'),
			active: activeTab === TradeTab.BUY,
			onClick: () => setActiveTab(TradeTab.BUY),
		},
		{
			name: TradeTab.SELL,
			label: t('futures.market.trade.input.sell'),
			active: activeTab === TradeTab.SELL,
			onClick: () => setActiveTab(TradeTab.SELL),
		},
	];

	const onTradeAmountChange = (value: string) => {
		setTradeSize(value);
		// We should probably compute this using Wei(). Problem is exchangeRates return numbers.
		setLeverage(
			(Number(value) * marketAssetRate) / Number(futuresMarketsPosition?.remainingMargin.toString())
		);
	};

	const onLeverageChange = (value: number) => {
		setLeverage(value);
		const newTradeSize =
			marketAssetRate === 0
				? 0
				: (value * Number(futuresMarketsPosition?.remainingMargin?.toString() ?? 0)) /
				  marketAssetRate;

		setTradeSize(newTradeSize.toString());
	};

	useEffect(() => {
		const getGasLimit = async () => {
			if (!synthetixjs || !marketAsset) return;
			if (!futuresMarketsPosition || !futuresMarketsPosition.remainingMargin) return;
			try {
				setError(null);
				setGasLimit(null);
				const FuturesMarketContract: Contract = getFuturesMarketContract(
					marketAsset,
					synthetixjs!.contracts
				);
				const gasEstimate = await FuturesMarketContract.estimateGas.submitOrder(
					wei(leverageSide === PositionSide.LONG ? leverage : -leverage).toBN()
				);
				setGasLimit(Number(gasEstimate));
			} catch (e) {
				console.log(e);
				setError(e?.data?.message ?? e.message);
			}
		};
		getGasLimit();
	}, [leverage, synthetixjs, marketAsset, futuresMarketsPosition, leverageSide]);

	const handleCreateOrder = async () => {
		if (!gasLimit || !leverage) return;
		try {
			const FuturesMarketContract: Contract = getFuturesMarketContract(
				marketAsset,
				synthetixjs!.contracts
			);
			console.log(FuturesMarketContract.address);
			const tx = await FuturesMarketContract.submitOrder(
				wei(leverageSide === PositionSide.LONG ? leverage : -leverage).toBN()
			);
			if (tx) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						futuresMarketPositionQuery.refetch();
					},
				});
			}
		} catch (e) {
			setError(e?.data?.message ?? e.message);
		}
	};

	return (
		<Panel>
			<TopRow>
				<FlexDivRow>
					<Title>{t('futures.market.trade.title')}</Title>
					<StyledTabList>
						{TABS.map(({ name, label, active, onClick }) => (
							<StyledTabButton key={name} name={name} active={active} onClick={onClick}>
								{label}
							</StyledTabButton>
						))}
					</StyledTabList>
				</FlexDivRow>
				<TradeSizeInput
					amount={tradeSize}
					assetRate={marketAssetRate}
					onAmountChange={(value) => onTradeAmountChange(value)}
					balance={futuresMarketsPosition?.remainingMargin ?? zeroBN}
					asset={marketAsset || Synths.sUSD}
					onLeverageChange={() => onLeverageChange(Number(market?.maxLeverage.toString() ?? 1))}
					balanceLabel={t('futures.market.trade.input.remaining-margin')}
				/>

				<LeverageInput
					currentLeverage={leverage}
					maxLeverage={Number(market?.maxLeverage.toString() ?? 1)}
					onSideChange={(side) => setLeverageSide(side)}
					onLeverageChange={(value) => onLeverageChange(value)}
					side={leverageSide}
				/>

				<FlexDivCol>
					<StyledGasPriceSelect {...{ gasPrices, transactionFee }} />
					<StyledFeeRateSummary feeRate={null} />
					<StyledFeeCostSummary feeCost={null} />
					<StyledSlippageSelcet
						maxSlippageTolerance={maxSlippageTolerance}
						setMaxSlippageTolerance={setMaxSlippageTolerance}
					/>
					{futuresMarketsPosition && futuresMarketsPosition.remainingMargin.gte(zeroBN) ? (
						<Button
							variant="primary"
							disabled={!gasLimit || !!error || !tradeSize}
							isRounded
							size="lg"
							onClick={handleCreateOrder}
						>
							{error
								? error
								: tradeSize
								? t('futures.market.trade.button.open-trade', { side: activeTab.toLowerCase() })
								: t('futures.market.trade.button.enter-amount')}
						</Button>
					) : (
						<FlexDivColCentered>
							<MarginTitle>{t('futures.market.trade.margin.deposit-susd')}</MarginTitle>
							<DepositMarginButton
								variant="primary"
								isRounded
								size="lg"
								onClick={() => setIsDepositMarginModalOpen(true)}
							>
								{t('futures.market.trade.button.deposit-margin')}
							</DepositMarginButton>
						</FlexDivColCentered>
					)}
				</FlexDivCol>
			</TopRow>
			<MarginSection
				availableMargin={futuresMarketsPosition?.remainingMargin ?? zeroBN}
				sUSDBalance={sUSDBalance}
				onDeposit={() => setIsDepositMarginModalOpen(true)}
			/>
			{isDepositMarginModalOpen && (
				<DepositMarginModal
					sUSDBalance={sUSDBalance}
					onTxConfirmed={() => console.log('here')}
					market={marketAsset}
					onDismiss={() => setIsDepositMarginModalOpen(false)}
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

const StyledTabList = styled(TabList)`
	margin-bottom: 12px;
`;

const StyledTabButton = styled(TabButton)`
	text-transform: capitalize;
	background: ${(props) => props.theme.colors.elderberry};
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

const StyledFeeRateSummary = styled(FeeRateSummary)`
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

const StyledSlippageSelcet = styled(SlippageSelect)`
	padding: 5px 0;
	display: flex;
	justify-content: space-between;
	width: auto;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.blueberry};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
	margin-bottom: 24px;
`;

const TopRow = styled(FlexDivCol)``;

const Panel = styled(FlexDivCol)`
	height: 100%;
	justify-content: space-between;
	padding-bottom: 48px;
`;

const MarginTitle = styled.h3`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
`;

const DepositMarginButton = styled(Button)`
	width: 100%;
`;
