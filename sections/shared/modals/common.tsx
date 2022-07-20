import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import { FlexDivRow } from 'styles/common';
import media from 'styles/media';

export const RowsHeader = styled(FlexDivRow)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 0 16px 9px 16px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

export const CenteredModal = styled(BaseModal)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	[data-reach-dialog-content] {
		margin: 0;
	}
	${media.lessThan('sm')`
		display: unset;
	`}
`;
