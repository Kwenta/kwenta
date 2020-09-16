import { FC } from 'react';
import styled from 'styled-components';

import Logo from './Logo';
import Nav from './Nav';
import UserMenu from './UserInfo';

import { GridDivCenteredCol } from 'styles/common';
import { DesktopView } from 'components/Media';

const Header: FC = () => {
	return (
		<Container>
			<LogoNav>
				<Logo />
				<DesktopView>
					<Nav />
				</DesktopView>
			</LogoNav>
			<UserMenu />
		</Container>
	);
};

const Container = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 40px;
`;

const LogoNav = styled(GridDivCenteredCol)`
	grid-gap: 24px;
`;

export default Header;
