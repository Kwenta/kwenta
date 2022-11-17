import { FC, memo } from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import { BigText, Title } from './common';

type GridDataProps = {
	title: string;
	value: string;
	hasKwentaLogo?: boolean;
};

const GridData: FC<GridDataProps> = memo(({ title, value, hasKwentaLogo }) => (
	<GridDataContainer>
		<Title>{title}</Title>
		<BigText hasKwentaLogo={hasKwentaLogo}>{value}</BigText>
	</GridDataContainer>
));

const GridDataContainer = styled.div`
	background-color: #181818;
	padding: 20px 24px 18px 24px;
	height: 50%;
	min-height: 95px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};

	${media.lessThan('mdUp')`
		padding: 20px;
    margin-top: 15px;
    border-radius: 15px;
		border: ${(props) => props.theme.colors.selectedTheme.border};
  `}
`;

export default GridData;
