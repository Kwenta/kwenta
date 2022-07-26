import { useFuturesContext } from 'contexts/FuturesContext';
import React from 'react';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import { Synths } from 'constants/currency';
import { formatCurrency, zeroBN } from 'utils/formatters/number';

import CrossMarginAccountActions from '../Trade/CrossMarginAccountActions';

const CrossMarginAccountInfoBox: React.FC = () => {
	const { crossMarginAccount } = useFuturesContext();

	return (
		<>
			<CrossMarginAccountActions />

			<StyledInfoBox
				details={{
					'Available Account Margin': {
						value: `${formatCurrency(Synths.sUSD, crossMarginAccount?.freeMargin || zeroBN, {
							currencyKey: Synths.sUSD,
							sign: '$',
						})}`,
					},
				}}
			>
				{' '}
			</StyledInfoBox>
		</>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default CrossMarginAccountInfoBox;
