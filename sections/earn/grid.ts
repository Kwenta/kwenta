import styled from 'styled-components';

import media from 'styles/media';

export const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	border-radius: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	background-color: ${(props) => props.theme.colors.selectedTheme.surfaceFill};
	${media.lessThan('mdUp')`
		flex-direction: column;
	`}
`;
