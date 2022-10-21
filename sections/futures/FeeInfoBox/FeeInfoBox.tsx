import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import {
	tradeFeesState,
	marketInfoState,
	orderTypeState,
	sizeDeltaState,
	futuresAccountTypeState,
	crossMarginSettingsState,
} from 'store/futures';
import { computeNPFee, computeMarketFee } from 'utils/costCalculations';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const orderType = useRecoilValue(orderTypeState);
	const fees = useRecoilValue(tradeFeesState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const marketInfo = useRecoilValue(marketInfoState);
	const accountType = useRecoilValue(futuresAccountTypeState);
	const { tradeFee: crossMarginTradeFee, limitOrderFee, stopOrderFee } = useRecoilValue(
		crossMarginSettingsState
	);

	const { commitDeposit, nextPriceFee } = useMemo(() => computeNPFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const nextPriceDiscount = useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

	const staticRate = useMemo(() => computeMarketFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit' ? limitOrderFee : orderType === 'stop-market' ? stopOrderFee : null,
		[orderType, stopOrderFee, limitOrderFee]
	);

	const marketCostTooltip = useMemo(
		() => (
			<>
				{formatPercent(staticRate ?? zeroBN)}
				{fees.dynamicFeeRate?.gt(0) && (
					<>
						{' + '}
						<ToolTip>
							<StyledDynamicFee>{formatPercent(fees.dynamicFeeRate)}</StyledDynamicFee>
						</ToolTip>
					</>
				)}
			</>
		),
		[staticRate, fees.dynamicFeeRate]
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
				keyNode: formatPercent(crossMarginTradeFee),
			},

			'Total Fee': {
				value: formatDollars(fees.total, {
					minDecimals: fees.total.lt(0.01) ? 4 : 2,
				}),
			},
		};
		if (orderType === 'limit' || orderType === 'stop-market') {
			return {
				...crossMarginFeeInfo,
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit
						? formatCurrency('ETH', fees.keeperEthDeposit, { currencyKey: 'ETH' })
						: NO_VALUE,
				},
			};
		}
		if (orderType === 'next-price') {
			return {
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit ? formatDollars(marketInfo.keeperDeposit) : NO_VALUE,
				},
				'Commit Deposit': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
						: NO_VALUE,
				},
				'Total Deposit': {
					value: formatDollars(totalDeposit),
					spaceBeneath: true,
				},
				'Next-Price Discount': {
					value: !!nextPriceDiscount ? formatDollars(nextPriceDiscount) : NO_VALUE,
					color: nextPriceDiscount.lt(0) ? 'green' : nextPriceDiscount.gt(0) ? 'red' : undefined,
				},
				'Estimated Fees': {
					value: formatDollars(totalDeposit.add(nextPriceDiscount ?? zeroBN)),
					keyNode: fees.dynamicFeeRate?.gt(0) ? <ToolTip /> : null,
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
		orderType,
		crossMarginTradeFee,
		fees,
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

const StyledDynamicFee = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gold};
	margin-left: 5px;
`;

const StyledTimerIcon = styled(TimerIcon)`
	margin-left: 5px;
	path {
		fill: ${(props) => props.theme.colors.selectedTheme.gold};
	}
`;

export default FeeInfoBox;
