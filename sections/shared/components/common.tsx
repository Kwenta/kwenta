import styled from 'styled-components';

import { numericValueCSS } from 'styles/common';
import media from 'styles/media';

export const SummaryItem = styled.div`
	display: grid;
	grid-gap: 4px;
	width: 110px;
	${media.lessThan('md')`
		width: unset;
	`}
`;

export const SummaryItemLabel = styled.div`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 13px;
`;

export const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	${numericValueCSS};
	max-width: 100px;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: 13px;
`;
