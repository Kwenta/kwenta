import { FC } from 'react';
import styled from 'styled-components';

import Logo from './Logo';
import Nav from './Nav';
import UserMenu from './UserInfo';

import { GridDivCenteredCol } from 'styles/common';
import { MobileHiddenView } from 'components/Media';
import { HEADER_HEIGHT, zIndex } from 'constants/ui';
import media from 'styles/media';

const Header: FC = () => (
	<Container>
		<LogoNav>
			<Logo />
			<MobileHiddenView>
				<Nav />
			</MobileHiddenView>
		</LogoNav>
		<UserMenu />
	</Container>
);

const Container = styled.header`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: ${zIndex.BASE};
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: ${HEADER_HEIGHT};
	line-height: ${HEADER_HEIGHT};
	padding: 0 20px;
	${media.lessThan('sm')`
		background-color: ${(props) => props.theme.colors.black};
		box-shadow: 0 0 16px 0 ${(props) => props.theme.colors.black};
	`};
`;

const LogoNav = styled(GridDivCenteredCol)`
	grid-gap: 24px;
`;

export default Header;
