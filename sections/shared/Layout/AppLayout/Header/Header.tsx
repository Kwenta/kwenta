import { FC } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { MobileHiddenView } from 'components/Media';
import { zIndex } from 'constants/ui';

import Logo from '../../Logo';

import Nav from './Nav';
import { isL2State } from 'store/wallet';
import WalletButtons from './WalletButtons';

const Header: FC = () => {
	const isL2 = useRecoilValue(isL2State);

	return (
		<Container isL2={isL2}>
			<MobileHiddenView>
				<LogoNav>
					<StyledLogo isL2={isL2} isFutures />
					<Nav />
				</LogoNav>
				<WalletButtons />
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
	}
`;

const LogoNav = styled.div`
	display: flex;
	align-items: center;
`;

const StyledLogo = styled(Logo)``;

export default Header;
