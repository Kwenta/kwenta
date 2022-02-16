import styled, { css } from 'styled-components';

export const Column = styled.div`
	padding: 18px;
	outline: 1px solid #353333;
`;

export const SplitColumn = styled.div<{ $isLast?: boolean }>`
	disply: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;

	${(props) => !props.$isLast && css``}

	& > div {
		padding: 18px 24px;
		height: 50%;
	}

	& > div:last-child {
		border-top: 1px solid #353333;
	}
`;

export const InfoGridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 266px 1fr;
	border-radius: 15px;
	border: 1px solid #353333;
	height: 188px;
	max-width: 915px;
	overflow: hidden;

	& > div {
		border-left: 1px solid #353333;
		border-right: 1px solid #353333;

		&:first-child,
		&:last-child {
			border-left: none;
			border-right: none;
		}
	}
`;
