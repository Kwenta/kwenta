import styled from 'styled-components';

import Button from 'components/Button';

import { GridDivCenteredRow, numericValueCSS } from 'styles/common';
import media from 'styles/media';

export const SummaryItems = styled.div<{ attached?: boolean }>`
	display: flex;
	flex-direction: row;
	flex-grow: 1;
	padding: 16px 32px;
	justify-content: space-between;
`;

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
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 13px;
	line-height: 100%;
`;

export const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
	max-width: 100px;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: 13px;
	line-height: 100%;
`;

export const MessageContainer = styled(GridDivCenteredRow)<{
	attached?: boolean;
	showProvider?: boolean;
}>`
	-webkit-box-align: center;
	width: 565px;
	border-radius: 4px;
	grid-template-columns: ${(props) => props.showProvider && '.5fr'} 1fr;
	grid-template-rows: 99px 70px;
	margin: 0 0 20px;
`;

export const FixedMessageContainerSpacer = styled.div`
	height: 70px;
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white}
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
})`
	font-size: 17px;
	height: 55px;
`;
