import styled from 'styled-components';

import { FlexDivCentered } from 'components/layout/flex';

const TradeConfirmationRow = styled(FlexDivCentered)`
	justify-content: space-between;
	padding: 8px 0;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	&:last-child {
		border: none;
	}
`;

export default TradeConfirmationRow;
