import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

import { HEADER_HEIGHT } from 'constants/ui';
import BaseModal from 'components/BaseModal';
import media from 'styles/media';

export const RowsContainer = styled.div`
	overflow: auto;
	height: 100%;
`;

export const RowsHeader = styled(FlexDivRow)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 0 16px 9px 16px;
`;

export const MenuModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		margin-left: auto;
		padding: 0;
		margin-right: 12px;
		margin-top: calc(${HEADER_HEIGHT} + 10px);
		${media.lessThan('sm')`
			margin: 0;
		`}
	}
	.card-body {
		padding: 24px;
	}
`;
