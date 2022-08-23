import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import { useFuturesContext } from 'contexts/FuturesContext';
import { formatDollars } from 'utils/formatters/number';

export default function CrossMarginFeesBox() {
	const { tradeFees } = useFuturesContext();

	return (
		<StyledInfoBox
			dataTestId="market-info-box"
			details={{
				Fees: {
					value: formatDollars(tradeFees.total),
				},
			}}
		/>
	);
}

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;
