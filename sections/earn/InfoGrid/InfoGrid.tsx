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
		min-height: 95px;
	}

	& > div:last-child {
		border-top: 1px solid #353333;
	}
`;

export const InfoGridContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(auto, 1fr));
	border-radius: 15px;
	border: 1px solid #353333;
	max-width: 915px;
	overflow: hidden;
	box-sizing: border: box;

	div {
		box-sizing: border-box;
	}

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
