import styled from 'styled-components';

import { FlexDivColCentered } from 'components/layout/flex';
import { GridDiv } from 'components/layout/grid';
import media from 'styles/media';

export const StackSection = styled(FlexDivColCentered)`
	width: 100%;
	${(props) => props.theme.animations.show};
`;

export const GridContainer = styled(GridDiv)`
	grid-template-columns: repeat(2, 280px);
	grid-gap: 24px;
	justify-content: center;
	${media.lessThan('md')`
		grid-template-columns: repeat(2, auto);
	`}
	${media.lessThan('sm')`
		grid-template-columns: 1fr;
	`}
`;
