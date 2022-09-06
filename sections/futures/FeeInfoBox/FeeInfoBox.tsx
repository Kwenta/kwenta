import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import InfoBox from 'components/InfoBox';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import {
	tradeFeesState,
	marketInfoState,
	orderTypeState,
	sizeDeltaState,
	futuresAccountTypeState,
	crossMarginSettingsState,
} from 'store/futures';
import { computeNPFee, computeMarketFee } from 'utils/costCalculations';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const orderType = useRecoilValue(orderTypeState);
	const fees = useRecoilValue(tradeFeesState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const marketInfo = useRecoilValue(marketInfoState);
	const accountType = useRecoilValue(futuresAccountTypeState);
	const { tradeFee: crossMarginTradeFee } = useRecoilValue(crossMarginSettingsState);

	const { commitDeposit, nextPriceFee } = React.useMemo(() => computeNPFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const totalDeposit = React.useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const nextPriceDiscount = React.useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

	const staticRate = React.useMemo(() => computeMarketFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const marketCostTooltip = (
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
	);

	return (
		<StyledInfoBox
			details={{
				...(orderType === 1
					? {
							'Keeper Deposit': {
								value: !!marketInfo?.keeperDeposit
									? formatCurrency(selectedPriceCurrency.name, marketInfo.keeperDeposit, {
											sign: selectedPriceCurrency.sign,
											minDecimals: 2,
									  })
									: NO_VALUE,
							},
							'Commit Deposit': {
								value: !!commitDeposit
									? formatCurrency(selectedPriceCurrency.name, commitDeposit, {
											sign: selectedPriceCurrency.sign,
											minDecimals: commitDeposit.lt(0.01) ? 4 : 2,
									  })
									: NO_VALUE,
							},
							'Total Deposit': {
								value: formatCurrency(selectedPriceCurrency.name, totalDeposit, {
									sign: selectedPriceCurrency.sign,
									minDecimals: 2,
								}),
								spaceBeneath: true,
							},
							'Next-Price Discount': {
								value: !!nextPriceDiscount
									? formatCurrency(selectedPriceCurrency.name, nextPriceDiscount, {
											sign: selectedPriceCurrency.sign,
											minDecimals: 2,
									  })
									: NO_VALUE,
								color: nextPriceDiscount.lt(0)
									? 'green'
									: nextPriceDiscount.gt(0)
									? 'red'
									: undefined,
							},
							'Estimated Fees': {
								value: formatCurrency(
									selectedPriceCurrency.name,
									totalDeposit.add(nextPriceDiscount ?? zeroBN),
									{
										minDecimals: 2,
										sign: selectedPriceCurrency.sign,
									}
								),
								keyNode: fees.dynamicFeeRate?.gt(0) ? <ToolTip /> : null,
							},
					  }
					: accountType === 'isolated_margin'
					? {
							Fee: {
								value: formatCurrency(selectedPriceCurrency.name, fees.total, {
									sign: selectedPriceCurrency.sign,
									minDecimals: fees.total.lt(0.01) ? 4 : 2,
								}),
								keyNode: marketCostTooltip,
							},
					  }
					: {
							'Protocol Fee': {
								value: formatCurrency(selectedPriceCurrency.name, fees.staticFee, {
									sign: selectedPriceCurrency.sign,
									minDecimals: fees.total.lt(0.01) ? 4 : 2,
								}),
								keyNode: marketCostTooltip,
							},
							'Cross Margin Fee': {
								value: formatCurrency(selectedPriceCurrency.name, fees.crossMarginFee, {
									sign: selectedPriceCurrency.sign,
									minDecimals: fees.total.lt(0.01) ? 4 : 2,
								}),
								spaceBeneath: true,
								keyNode: formatPercent(crossMarginTradeFee),
							},
							'Total Fee': {
								value: formatCurrency(selectedPriceCurrency.name, fees.total, {
									sign: selectedPriceCurrency.sign,
									minDecimals: fees.total.lt(0.01) ? 4 : 2,
								}),
							},
					  }),
			}}
		/>
	);
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
