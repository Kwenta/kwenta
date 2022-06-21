import React from 'react';
import styled from 'styled-components';
import { PositionSide } from 'sections/futures/types';

export const OpenPosition = () => {
	return <OpenPositionContainer></OpenPositionContainer>;
};

const OpenPositionContainer = styled.div<{ side?: PositionSide }>`
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
`;

const OpenPositions: React.FC = () => {
	return <div></div>;
};

export default OpenPositions;
