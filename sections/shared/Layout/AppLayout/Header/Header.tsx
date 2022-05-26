import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { MobileHiddenView } from 'components/Media';
import { zIndex } from 'constants/ui';
import { GridDivCol } from 'styles/common';

import Logo from '../../Logo';

import Nav from './Nav';
import UserMenu from './UserMenu';
import { isL2State } from 'store/wallet';

const Header: FC = () => {
	const isL2 = useRecoilValue(isL2State);
	const logo = useMemo(() => <Logo isL2={isL2} isFutures />, [isL2]);

	return (
		<Container isL2={isL2}>
			<MobileHiddenView>
				<LogoNav>
					{logo}
					<Nav />
				</LogoNav>
				<UserMenu />
			</MobileHiddenView>
		</Container>
	);
};

const Container = styled.header<{ isL2: boolean }>`
	top: 0;
	left: 0;
	right: 0;
	z-index: ${zIndex.HEADER};

	> div {
		padding-bottom: 20px;
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
