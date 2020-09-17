import { FC } from 'react';
import styled from 'styled-components';

import Logo from './Logo';
import Nav from './Nav';
import UserMenu from './UserInfo';

import { GridDivCenteredCol } from 'styles/common';
import { MobileHiddenView } from 'components/Media';
import { HEADER_HEIGHT, zIndex } from 'constants/ui';

const Header: FC = () => (
	<FixedPosition>
		<Container>
			<LogoNav>
				<Logo />
				<MobileHiddenView>
					<Nav />
				</MobileHiddenView>
			</LogoNav>
			<UserMenu />
		</Container>
	</FixedPosition>
);

const FixedPosition = styled.div`
	position: absolute;
	top: 0;
	left: 20px;
	right: 20px;
	z-index: ${zIndex.BASE};
`;

const Container = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: ${HEADER_HEIGHT};
`;

const LogoNav = styled(GridDivCenteredCol)`
	grid-gap: 24px;
`;

export default Header;
