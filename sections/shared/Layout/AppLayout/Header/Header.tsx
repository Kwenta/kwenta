import { FC } from 'react';
import styled from 'styled-components';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { zIndex } from 'constants/ui';

import media from 'styles/media';

import Logo from '../../Logo';

import Nav from './Nav';
import UserMenu from './UserMenu';
import MobileUserMenu from './MobileUserMenu';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';

const Header: FC = () => {
	const isL2 = useRecoilValue(isL2State);

	return (
		<Container isL2={isL2}>
			<MobileHiddenView>
				<LogoNav>
					<StyledLogo isL2={isL2} isFutures={true} />
					<Nav />
				</LogoNav>
				<UserMenu />
			</MobileHiddenView>
			<MobileOnlyView>
				<LogoNav>
					<StyledLogo isL2={isL2} isFutures={true} />
				</LogoNav>
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
		padding-bottom: 20px;
		display: flex;
		justify-content: space-between;
	}
`;

const LogoNav = styled.div`
	display: flex;
	align-items: center;
`;

const StyledLogo = styled(Logo)``;

export default Header;
