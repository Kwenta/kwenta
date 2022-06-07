import styled, { css } from 'styled-components';

import Button from 'components/Button';

import { FixedFooterMixin, GridDivCenteredRow, numericValueCSS } from 'styles/common';
import media from 'styles/media';
import { zIndex } from 'constants/ui';

export const SummaryItems = styled.div<{ attached?: boolean }>`
	display: grid;
	grid-auto-flow: column;
	flex-grow: 1;
	padding-left: 32px;
	justify-content: space-between;
	${media.lessThan('md')`
		grid-auto-flow: unset;
		grid-template-columns: auto auto;
		grid-template-rows: auto auto;
		grid-gap: 20px;
	`}
	${(props) =>
		props.attached &&
		css`
			& {
				grid-template-rows: unset;
			}
		`}
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
`;

export const SummaryItemValue = styled.div`
	color: ${(props) => props.theme.colors.white};
	${numericValueCSS};
	max-width: 100px;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: 13px;
`;

export const MessageContainer = styled(GridDivCenteredRow)<{
	attached?: boolean;
	showProvider?: boolean;
}>`
	-webkit-box-align: center;
	width: 100%;
	border-radius: 4px;
	grid-template-columns: ${(props) => props.showProvider && '.5fr'} 1fr;
	grid-template-rows: 99px 70px;
	margin: 0 0 20px;

	/*
	width: 100%;
	border-radius: 1000px;
	grid-template-columns: 1fr auto;
	padding: 16px 32px;
	max-width: 750px;
	margin: 0 auto;
	*/

	${(props) =>
		props.attached &&
		css`
			border-radius: 4px;
		`}
	${media.lessThan('md')`
		${FixedFooterMixin};
		box-shadow: 0 -8px 8px 0 ${(props) => props.theme.colors.black};
		justify-content: center;
		display: flex;
		z-index: ${zIndex.BASE};
	`}
`;

export const FixedMessageContainerSpacer = styled.div`
	height: 70px;
`;

export const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.bold};
	flex-grow: 1;
	text-align: center;
`;

export const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
	fullwidth: true,
})`
	font-size: 17px;
	height: 55px;
	width: 100%;
`;
