import styled from 'styled-components';

import media from 'styles/media';

export const GridContainer = styled.div`
	display: flex;

	${media.greaterThan('mdUp')`
		flex-wrap: wrap;
		border-radius: 15px;
		border: ${(props) => props.theme.colors.selectedTheme.border};
		overflow: hidden;
		background-color: ${(props) => props.theme.colors.selectedTheme.surfaceFill};

		& > div {
			box-sizing: border-box;
			border-left: ${(props) => props.theme.colors.selectedTheme.border};
			border-right: ${(props) => props.theme.colors.selectedTheme.border};
			min-width: 50%;

			&:nth-child(2n), &:nth-child(2n+2) {
				border-right: none;
			}

			&:nth-child(3) {
				border-bottom: none;
			}

			&:first-child,
			&:last-child {
				border-left: none;
				border-right: none;
			}
		}
	`}

	${media.lessThan('mdUp')`
		flex-direction: column;
	`}
`;
