import React, { FC } from 'react';
import styled from 'styled-components';
import Wei, { WeiSource } from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';

import { useTranslation } from 'react-i18next';

import TimerIcon from 'assets/svg/app/timer.svg';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { computeNPFee, computeMarketFee } from 'utils/costCalculations';
import { useRecoilValue } from 'recoil';
import { feeCostState, orderTypeState, sizeDeltaState } from 'store/futures';

type FeeInfoBoxProps = {
	dynamicFee: Wei | WeiSource | null;
};

const FeeInfoBox: React.FC<FeeInfoBoxProps> = ({ dynamicFee }) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const costDetailsQuery = useGetNextPriceDetails();
	const costDetails = costDetailsQuery.data;
	const { t } = useTranslation();
	const orderType = useRecoilValue(orderTypeState);
	const feeCost = useRecoilValue(feeCostState);
	const sizeDelta = useRecoilValue(sizeDeltaState);

	const { commitDeposit, nextPriceFee } = React.useMemo(
		() => computeNPFee(costDetails, sizeDelta),
		[costDetails, sizeDelta]
	);

	const totalDeposit = React.useMemo(() => {
		return (commitDeposit ?? zeroBN).add(costDetails?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, costDetails?.keeperDeposit]);

	const nextPriceDiscount = React.useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

	const staticRate = React.useMemo(() => computeMarketFee(costDetails, sizeDelta), [
		costDetails,
		sizeDelta,
	]);

	const ToolTip: FC = (props) => (
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

	const marketCostTooltip = (
		<>
			{formatPercent(staticRate ?? zeroBN)}
			{dynamicFee?.gt(0) && (
				<>
					{' + '}
					<ToolTip>
						<StyledDynamicFee>{formatPercent(dynamicFee)}</StyledDynamicFee>
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
								value: !!costDetails?.keeperDeposit
									? formatCurrency(selectedPriceCurrency.name, costDetails.keeperDeposit, {
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
								keyNode: dynamicFee?.gt(0) ? <ToolTip /> : null,
							},
					  }
					: {
							Fee: {
								value: !!feeCost
									? formatCurrency(selectedPriceCurrency.name, feeCost, {
											sign: selectedPriceCurrency.sign,
											minDecimals: feeCost.lt(0.01) ? 4 : 2,
									  })
									: NO_VALUE,
								keyNode: marketCostTooltip,
							},
					  }),
			}}
		/>
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
