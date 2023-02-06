import styled from 'styled-components';

import { PriceColorOptions } from 'state/prices/types';

const ColoredPrice = styled.div<{ color: PriceColorOptions }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme[props.color]};
`;

export default ColoredPrice;
