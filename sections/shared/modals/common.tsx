import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';

import { HEADER_HEIGHT } from 'constants/ui';
import BaseModal from 'components/BaseModal';
import media from 'styles/media';

export const RowsContainer = styled.div`
	overflow: auto;
`;

export const RowsHeader = styled(FlexDivRow)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 0 16px 9px 16px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

export const MenuModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		margin-left: auto;
		padding: 0;
		margin-right: 31px;
		margin-top: calc(${HEADER_HEIGHT} - 35px);
		${media.lessThan('sm')`
			margin: 0;
		`}
	}
	.card-body {
		padding: 24px;
	}
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
