import { FC } from 'react';
import styled from 'styled-components';
import { useNetwork, chain } from 'wagmi';

import { MobileHiddenView } from 'components/Media';
import { zIndex } from 'constants/ui';

import Logo from '../../Logo';
import Nav from './Nav';
import WalletButtons from './WalletButtons';

const Header: FC = () => {
	const { chain: network } = useNetwork();
	const isL2 =
		network !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(network?.id)
			: true;

	return (
		<Container isL2={isL2}>
			<MobileHiddenView>
				<LogoNav>
					<Logo />
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

export default Header;
