import { FC } from 'react';
import styled from 'styled-components';

import Logo from '../Logo';

import { GridDivCenteredCol } from 'styles/common';
import { HEADER_HEIGHT } from 'constants/ui';

const Header: FC = () => (
	<Container>
		<LogoNav>
			<Logo />
		</LogoNav>
	</Container>
);

const Container = styled.header`
	height: ${HEADER_HEIGHT};
	line-height: ${HEADER_HEIGHT};
	padding: 0 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const LogoNav = styled(GridDivCenteredCol)`
	grid-gap: 24px;
`;

export default Header;
