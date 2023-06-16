import { FC } from 'react';
import styled from 'styled-components';

type DisplayProps = {};

const Display: FC<DisplayProps> = ({ ...props }) => {
	return <StyledDisplay {...props} />;
};

const StyledDisplay = styled.p`
	line-height: 1.2;
`;

export default Display;
