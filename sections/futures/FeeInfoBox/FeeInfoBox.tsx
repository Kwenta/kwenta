import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import { computeMarketFee, computeNPFee } from 'utils/costCalculations';
import Connector from 'containers/Connector';
import { getMarketKey } from 'utils/futures';

import TimerIcon from 'assets/svg/app/timer.svg';

type FeeInfoBoxProps = {
	currencyKey: string | null;
	orderType: number;
	feeCost: Wei | null;
	dynamicFee: Wei | null;
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

	const { staticRate } = React.useMemo(() => computeMarketFee(costDetails, sizeDelta), [
		costDetails,
		sizeDelta,
	]);

	return orderType === 1 ? (
		<StyledInfoBox
			details={{
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
					color: nextPriceDiscount.lt(0) ? 'green' : nextPriceDiscount.gt(0) ? 'red' : undefined,
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
				},
			}}
		/>
	) : (
		<StyledContainer>
			<p className="key">
				Fee: {formatPercent(staticRate ?? zeroBN)}
				{dynamicFee?.gt(0) && (
					<>
						{'+'}
						<span className="yellow">
							{formatPercent(dynamicFee)} <TimerIcon />
						</span>
					</>
				)}
			</p>
			<p className="value">
				{!!feeCost
					? formatCurrency(selectedPriceCurrency.name, feeCost, {
							sign: selectedPriceCurrency.sign,
							minDecimals: feeCost.lt(0.01) ? 4 : 2,
					  })
					: NO_VALUE}
			</p>
		</StyledContainer>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

const StyledContainer = styled.div`
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 14px;
	box-sizing: border-box;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.key {
		color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
		font-size: 12px;
		text-transform: capitalize;
	}

	.value {
		color: ${(props) => props.theme.colors.common.primaryWhite};
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 12px;
	}

	.yellow {
		color: ${(props) => props.theme.colors.yellow};
	}
`;

export default FeeInfoBox;
