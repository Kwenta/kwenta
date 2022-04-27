import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import { Synths } from 'constants/currency';

type FeeInfoBoxProps = {
	currencyKey: string | null;
	orderType: number;
	feeCost: Wei | null;
};

const FeeInfoBox: React.FC<FeeInfoBoxProps> = ({ orderType, feeCost, currencyKey }) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const nextPriceDetailsQuery = useGetNextPriceDetails(currencyKey);
	const nextPriceDetails = nextPriceDetailsQuery.data;

	// TODO: Confirm that the commit deposit is correct.
	// We can ensure this in the future by calculating it on the frontend.
	// However, it would be nice to have the calculations directly in the contract.

	return (
		<StyledInfoBox
			details={{
				...(orderType === 1 && {
					'Keeper Deposit': !!nextPriceDetails?.keeperDeposit
						? formatCurrency(selectedPriceCurrency.name, nextPriceDetails.keeperDeposit, {
								sign: selectedPriceCurrency.sign,
								minDecimals: 2,
						  })
						: NO_VALUE,
				}),
				[orderType === 1 ? 'Commit Deposit' : 'Fee']:
					feeCost != null
						? formatCurrency(selectedPriceCurrency.name, feeCost, {
								sign: selectedPriceCurrency.sign,
								minDecimals: feeCost.lt(0.01) ? 4 : 2,
						  })
						: NO_VALUE,
				...(orderType === 1 && {
					Total: formatCurrency(
						selectedPriceCurrency.name,
						(feeCost ?? zeroBN).add(nextPriceDetails?.keeperDeposit ?? 0),
						{ sign: selectedPriceCurrency.sign, minDecimals: 2 }
					),
				}),
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default FeeInfoBox;
