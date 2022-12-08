import { wei } from '@synthetixio/wei';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import {
	selectFuturesType,
	selectIsolatedTradeInputs,
	selectMarketFeeRates,
	selectMarketInfo,
	selectOrderType,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { tradeFeesState } from 'store/futures';
import { computeDelayedOrderFee, computeMarketFee } from 'utils/costCalculations';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const orderType = useAppSelector(selectOrderType);
	const { nativeSize } = useAppSelector(selectIsolatedTradeInputs);
	const accountType = useAppSelector(selectFuturesType);
	const marketInfo = useAppSelector(selectMarketInfo);
	const feeRates = useAppSelector(selectMarketFeeRates);

	const sizeDelta = useMemo(() => wei(nativeSize === '' ? 0 : nativeSize), [nativeSize]);

	const fees = useRecoilValue(tradeFeesState);

	const { commitDeposit, delayedOrderFee } = useMemo(
		() => computeDelayedOrderFee(marketInfo, sizeDelta),
		[marketInfo, sizeDelta]
	);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const nextPriceDiscount = useMemo(() => {
		return (delayedOrderFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, delayedOrderFee]);

	const staticRate = useMemo(() => computeMarketFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit'
				? feeRates.limitOrderFee
				: orderType === 'stop market'
				? feeRates.stopOrderFee
				: null,
		[orderType, feeRates.stopOrderFee, feeRates.limitOrderFee]
	);

	const marketCostTooltip = useMemo(
		() => (
			<>
				{sizeDelta.abs().gt(0)
					? formatPercent(staticRate ?? zeroBN)
					: `${formatPercent(feeRates.makerFee ?? zeroBN)} / ${formatPercent(
							feeRates.takerFee ?? zeroBN
					  )}`}
			</>
		),
		[feeRates, staticRate, sizeDelta]
	);

	const feesInfo = useMemo<Record<string, DetailedInfo | null | undefined>>(() => {
		const crossMarginFeeInfo = {
			'Protocol Fee': {
				value: formatDollars(fees.staticFee, {
					minDecimals: fees.staticFee.lt(0.01) ? 4 : 2,
				}),
				keyNode: marketCostTooltip,
			},
			'Limit / Stop Fee':
				fees.limitStopOrderFee.gt(0) && orderFeeRate
					? {
							value: formatDollars(fees.limitStopOrderFee, {
								minDecimals: fees.limitStopOrderFee.lt(0.01) ? 4 : 2,
							}),
							keyNode: formatPercent(orderFeeRate),
					  }
					: null,
			'Cross Margin Fee': {
				value: formatDollars(fees.crossMarginFee, {
					minDecimals: fees.crossMarginFee.lt(0.01) ? 4 : 2,
				}),
				spaceBeneath: true,
				keyNode: formatPercent(feeRates.tradeFee),
			},

			'Total Fee': {
				value: formatDollars(fees.total, {
					minDecimals: fees.total.lt(0.01) ? 4 : 2,
				}),
			},
		};
		if (orderType === 'limit' || orderType === 'stop market') {
			return {
				...crossMarginFeeInfo,
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit
						? formatCurrency('ETH', fees.keeperEthDeposit, { currencyKey: 'ETH' })
						: NO_VALUE,
				},
			};
		}
		if (orderType === 'delayed') {
			return {
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit ? formatDollars(marketInfo.keeperDeposit) : NO_VALUE,
				},
				'Commit Deposit': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
						: NO_VALUE,
					keyNode: formatPercent(staticRate),
				},
				'Total Deposit': {
					value: formatDollars(totalDeposit),
					spaceBeneath: true,
				},
				// 'Next Price Discount': {
				// 	value: !!nextPriceDiscount ? formatDollars(nextPriceDiscount) : NO_VALUE,
				// 	color: nextPriceDiscount.lt(0) ? 'green' : nextPriceDiscount.gt(0) ? 'red' : undefined,
				// },
				'Estimated Fees': {
					value: formatDollars(totalDeposit.add(nextPriceDiscount ?? zeroBN)),
				},
			};
		}
		return accountType === 'isolated_margin'
			? {
					Fee: {
						value: formatDollars(fees.total, {
							minDecimals: fees.total.lt(0.01) ? 4 : 2,
						}),
						keyNode: marketCostTooltip,
					},
			  }
			: crossMarginFeeInfo;
	}, [
		feeRates,
		staticRate,
		fees,
		orderType,
		orderFeeRate,
		commitDeposit,
		accountType,
		marketInfo?.keeperDeposit,
		nextPriceDiscount,
		marketCostTooltip,
		totalDeposit,
	]);

	return <StyledInfoBox details={feesInfo} />;
};

const ToolTip: FC = (props) => {
	const { t } = useTranslation();

	return (
		<DynamicStyledToolTip
			height={'auto'}
			preset="bottom"
			width="300px"
			content={t('futures.market.trade.cost-basis.tooltip')}
			style={{ textTransform: 'none' }}
		>
			{props.children}
			<StyledTimerIcon />
		</DynamicStyledToolTip>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

const DynamicStyledToolTip = styled(StyledTooltip)`
	padding: 10px;
`;

const StyledTimerIcon = styled(TimerIcon)`
	margin-left: 5px;
	path {
		fill: ${(props) => props.theme.colors.selectedTheme.gold};
	}
`;

export default FeeInfoBox;
