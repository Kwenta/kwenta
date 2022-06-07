import React, { FC } from 'react';
import styled from 'styled-components';
import Wei, { WeiSource } from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';

import Connector from 'containers/Connector';
import { getMarketKey } from 'utils/futures';
import { useTranslation } from 'react-i18next';

import TimerIcon from 'assets/svg/app/timer.svg';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { computeNPFee, computeMarketFee } from 'utils/costCalculations';

type FeeInfoBoxProps = {
	currencyKey: string | null;
	orderType: number;
	feeCost: Wei | null;
	dynamicFee: Wei | WeiSource | null;
	sizeDelta: Wei;
};

const FeeInfoBox: React.FC<FeeInfoBoxProps> = ({
	orderType,
	feeCost,
	dynamicFee,
	currencyKey,
	sizeDelta,
}) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const { network } = Connector.useContainer();
	const costDetailsQuery = useGetNextPriceDetails(getMarketKey(currencyKey, network.id));
	const costDetails = costDetailsQuery.data;
	const { t } = useTranslation();

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
		<StyledTooltip
			height={'auto'}
			preset="bottom"
			width="300px"
			content={t('futures.market.trade.cost-basis.tooltip')}
			style={{ textTransform: 'none' }}
		>
			{props.children}
			<StyledTimerIcon />
		</StyledTooltip>
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

const StyledDynamicFee = styled.span`
	color: ${(props) => props.theme.colors.yellow};
	margin-left: 5px;
`;

const StyledTimerIcon = styled(TimerIcon)`
	margin-left: 5px;
`;

export default FeeInfoBox;
