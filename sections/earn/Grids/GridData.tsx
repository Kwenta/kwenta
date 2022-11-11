import { FC, memo } from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import { BigText, Title } from '../common';

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
	${media.lessThan('mdUp')`
    margin-top: 15px;
    border-radius: 15px;
  `}
`;

export default GridData;
