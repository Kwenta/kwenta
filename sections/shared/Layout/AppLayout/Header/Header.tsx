import { FC } from 'react';
import styled from 'styled-components';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { HEADER_HEIGHT, HEADER_TOP_PADDING, zIndex } from 'constants/ui';

import { GridDivCol } from 'styles/common';
import media from 'styles/media';

import Logo from '../../Logo';

import Nav from './Nav';
import UserMenu from './UserMenu';
import MobileUserMenu from './MobileUserMenu';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';

const Header: FC = () => {
	const isL2 = useRecoilValue(isL2State);

	const logo = <Logo isL2={isL2} isFutures={true} />;

	return (
		<Container isL2={isL2}>
			<MobileHiddenView>
				<LogoNav>
					{logo}
					<Nav />
				</LogoNav>
				<UserMenu />
			</MobileHiddenView>
			<MobileOnlyView>
				<LogoNav>{logo}</LogoNav>
				<MobileUserMenu />
			</MobileOnlyView>
		</Container>
	);
};

const Container = styled.header<{ isL2: boolean }>`
	top: 0;
	left: 0;
	right: 0;
	z-index: ${zIndex.HEADER};
	${media.lessThan('md')`
		position: fixed;
		background-color: ${(props) => props.theme.colors.black};
		box-shadow: 0 8px 8px 0 ${(props) => props.theme.colors.black};
	`};
	> div {
		height: ${HEADER_HEIGHT};
		padding-top: ${HEADER_TOP_PADDING};
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
`;

const LogoNav = styled(GridDivCol)`
	padding-top: 8px;
	grid-gap: 24px;
	align-items: start;
`;

export default Header;
