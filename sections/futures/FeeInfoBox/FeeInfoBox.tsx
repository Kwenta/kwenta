import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

type FeeInfoBoxProps = {
	transactionFee: number | null;
	feeCost: Wei | null;
};

const FeeInfoBox: React.FC<FeeInfoBoxProps> = ({ transactionFee, feeCost }) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	return (
		<StyledInfoBox
			details={{
				Fee:
					feeCost != null
						? formatCurrency(selectedPriceCurrency.name as CurrencyKey, feeCost, {
								sign: selectedPriceCurrency.sign,
								minDecimals: feeCost.lt(0.01) ? 4 : 2,
						  })
						: NO_VALUE,
				'Gas Fee/Cost': transactionFee
					? `${formatCurrency(selectedPriceCurrency.name as CurrencyKey, transactionFee, {
							sign: selectedPriceCurrency.sign,
							maxDecimals: 1,
					  })}`
					: NO_VALUE,
				Total: formatCurrency(
					selectedPriceCurrency.name as CurrencyKey,
					feeCost?.add(transactionFee ?? 0) ?? zeroBN,
					{
						sign: selectedPriceCurrency.sign,
						minDecimals: feeCost?.lt(0.01) ? 4 : 2,
					}
				),
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default FeeInfoBox;
