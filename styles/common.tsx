import styled, { css, keyframes } from 'styled-components';

export const FlexDiv = styled.div`
	display: flex;
`;

export const FlexDivCentered = styled(FlexDiv)`
	align-items: center;
`;

export const FlexDivCol = styled(FlexDiv)`
	flex-direction: column;
`;

export const FlexDivRow = styled(FlexDiv)`
	justify-content: space-between;
`;

export const FlexDivRowCentered = styled(FlexDivRow)`
	align-items: center;
`;

export const linkCSS = css`
	text-decoration: none;
	&:hover {
		text-decoration: none;
	}
`;

export const ExternalLink = styled.a.attrs({
	target: '_blank',
	rel: 'noopener',
})`
	${linkCSS};
`;

export const resetButtonCSS = css`
	border: none;
	background: none;
	outline: none;
	cursor: pointer;
	padding: 0;
`;

export const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOutAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const GridDiv = styled.div`
	display: grid;
`;

export const GridDivCentered = styled(GridDiv)`
	align-items: center;
`;

export const GridDivRow = styled(GridDiv)`
	grid-auto-flow: row;
`;

export const GridDivCenteredRow = styled(GridDivCentered)`
	grid-auto-flow: row;
`;

export const GridDivCol = styled(GridDiv)`
	grid-auto-flow: column;
`;

export const GridDivCenteredCol = styled(GridDivCentered)`
	grid-auto-flow: column;
`;

export const numericValueCSS = css`
	font-family: ${(props) => props.theme.fonts.mono};
`;

export const NumericValue = styled.span`
	${numericValueCSS};
`;

export const NoTextTransform = styled.span`
	text-transform: none;
`;

export const TextButton = styled.button`
	${resetButtonCSS};
	background: transparent;
`;

export const SelectableCurrencyRow = styled(FlexDivRowCentered)<{ isSelectable: boolean }>`
	padding: 5px 0;
	${(props) =>
		props.isSelectable
			? css`
					cursor: pointer;
					&:hover {
						background-color: ${(props) => props.theme.colors.black};
					}
			  `
			: css`
					opacity: 0.5;
					cursor: not-allowed;
			  `}
`;

export const CapitalizedText = styled.span`
	text-transform: capitalize;
`;
