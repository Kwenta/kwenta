import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import InfoBox from 'components/InfoBox';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

type FeeInfoBoxProps = {
	feeCost: Wei | null;
};

const FeeInfoBox: React.FC<FeeInfoBoxProps> = ({ feeCost }) => {
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
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default FeeInfoBox;
