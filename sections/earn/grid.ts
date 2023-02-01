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
			min-width: 50%;
		}
	`}

	${media.lessThan('mdUp')`
		flex-direction: column;
	`}
`;
