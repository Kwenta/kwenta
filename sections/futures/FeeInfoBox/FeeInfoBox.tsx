import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import { computeCommitDeposit } from 'utils/nextPrice';

type FeeInfoBoxProps = {
	currencyKey: string | null;
	orderType: number;
	feeCost: Wei | null;
	sizeDelta: Wei;
};

const FeeInfoBox: React.FC<FeeInfoBoxProps> = ({ orderType, feeCost, currencyKey, sizeDelta }) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const nextPriceDetailsQuery = useGetNextPriceDetails(currencyKey);
	const nextPriceDetails = nextPriceDetailsQuery.data;

	const commitDeposit = React.useMemo(() => computeCommitDeposit(nextPriceDetails, sizeDelta), [
		nextPriceDetails,
		sizeDelta,
	]);

	const totalDeposit = React.useMemo(() => {
		return (commitDeposit ?? zeroBN).add(nextPriceDetails?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceDetails?.keeperDeposit]);

	const nextPriceDiscount = React.useMemo(() => {
		return feeCost?.sub(totalDeposit);
	}, [feeCost, totalDeposit]);

	return (
		<StyledInfoBox
			details={{
				...(orderType === 1
					? {
							'Keeper Deposit': {
								value: !!nextPriceDetails?.keeperDeposit
									? formatCurrency(selectedPriceCurrency.name, nextPriceDetails.keeperDeposit, {
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
							},
							'Next-Price Discount': {
								value: !!nextPriceDiscount
									? formatCurrency(selectedPriceCurrency.name, nextPriceDiscount, {
											sign: selectedPriceCurrency.sign,
											minDecimals: 2,
									  })
									: NO_VALUE,
								color: 'green',
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
					  }
					: {
							Fee: {
								value:
									feeCost != null
										? formatCurrency(selectedPriceCurrency.name, feeCost, {
												sign: selectedPriceCurrency.sign,
												minDecimals: feeCost.lt(0.01) ? 4 : 2,
										  })
										: NO_VALUE,
							},
					  }),
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default FeeInfoBox;
