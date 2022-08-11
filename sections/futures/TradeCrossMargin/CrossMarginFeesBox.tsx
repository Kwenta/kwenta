import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import { useFuturesContext } from 'contexts/FuturesContext';
import { crossMarginMarginDeltaState } from 'store/futures';
import { formatDollars } from 'utils/formatters/number';

export default function CrossMarginFeesBox() {
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);

	const { tradeFees } = useFuturesContext();

	return (
		<StyledInfoBox
			dataTestId="market-info-box"
			details={{
				Fees: {
					value: formatDollars(tradeFees.total),
				},
				Cost: {
					value: formatDollars(marginDelta),
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
