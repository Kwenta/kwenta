import React, { useMemo } from 'react';
import styled from 'styled-components';

import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import { NO_VALUE } from 'constants/placeholder';
import {
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectDelayedOrderFee,
	selectFuturesType,
	selectIsolatedMarginFee,
	selectMarketInfo,
	selectOrderType,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { computeOrderFee } from 'utils/costCalculations';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const orderType = useAppSelector(selectOrderType);
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const isolatedMarginFee = useAppSelector(selectIsolatedMarginFee);
	const { nativeSizeDelta, susdSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const accountType = useAppSelector(selectFuturesType);
	const { tradeFee: crossMarginTradeFeeRate, limitOrderFee, stopOrderFee } = useAppSelector(
		selectCrossMarginSettings
	);
	const marketInfo = useAppSelector(selectMarketInfo);
	const { commitDeposit } = useAppSelector(selectDelayedOrderFee);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const { orderFee, makerFee, takerFee } = useMemo(
		() => computeOrderFee(marketInfo, susdSizeDelta, orderType),
		[marketInfo, susdSizeDelta, orderType]
	);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit' ? limitOrderFee : orderType === 'stop market' ? stopOrderFee : null,
		[orderType, stopOrderFee, limitOrderFee]
	);

	const marketCostTooltip = useMemo(
		() => (
			<>
				{nativeSizeDelta.abs().gt(0)
					? formatPercent(orderFee ?? zeroBN)
					: `${formatPercent(makerFee ?? zeroBN)} / ${formatPercent(takerFee ?? zeroBN)}`}
			</>
		),
		[orderFee, makerFee, takerFee, nativeSizeDelta]
	);

	const feesInfo = useMemo<Record<string, DetailedInfo | null | undefined>>(() => {
		const crossMarginFeeInfo = {
			'Protocol Fee': {
				value: formatDollars(crossMarginFees.staticFee, {
					minDecimals: crossMarginFees.staticFee.lt(0.01) ? 4 : 2,
				}),
				keyNode: marketCostTooltip,
			},
			'Limit / Stop Fee':
				crossMarginFees.limitStopOrderFee.gt(0) && orderFeeRate
					? {
							value: formatDollars(crossMarginFees.limitStopOrderFee, {
								minDecimals: crossMarginFees.limitStopOrderFee.lt(0.01) ? 4 : 2,
							}),
							keyNode: formatPercent(orderFeeRate),
					  }
					: null,
			'Cross Margin Fee': {
				value: formatDollars(crossMarginFees.crossMarginFee, {
					minDecimals: crossMarginFees.crossMarginFee.lt(0.01) ? 4 : 2,
				}),
				spaceBeneath: true,
				keyNode: formatPercent(crossMarginTradeFeeRate),
			},

			'Total Fee': {
				value: formatDollars(crossMarginFees.total, {
					minDecimals: crossMarginFees.total.lt(0.01) ? 4 : 2,
				}),
			},
		};
		if (orderType === 'limit' || orderType === 'stop market') {
			return {
				...crossMarginFeeInfo,
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit
						? formatCurrency('ETH', crossMarginFees.keeperEthDeposit, { currencyKey: 'ETH' })
						: NO_VALUE,
				},
			};
		}
		if (orderType === 'delayed' || orderType === 'delayed offchain') {
			return {
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit ? formatDollars(marketInfo.keeperDeposit) : NO_VALUE,
				},
				'Commit Deposit': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
						: NO_VALUE,
					keyNode: marketCostTooltip,
				},
				'Total Deposit': {
					value: formatDollars(totalDeposit),
					spaceBeneath: true,
				},
				'Estimated Fees': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
						: NO_VALUE,
				},
			};
		}
		return accountType === 'isolated_margin'
			? {
					Fee: {
						value: formatDollars(isolatedMarginFee, {
							minDecimals: isolatedMarginFee.lt(0.01) ? 4 : 2,
						}),
						keyNode: marketCostTooltip,
					},
			  }
			: crossMarginFeeInfo;
	}, [
		orderType,
		crossMarginTradeFeeRate,
		isolatedMarginFee,
		crossMarginFees,
		orderFeeRate,
		commitDeposit,
		accountType,
		marketInfo?.keeperDeposit,
		marketCostTooltip,
		totalDeposit,
	]);

	return <StyledInfoBox details={feesInfo} />;
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default FeeInfoBox;
