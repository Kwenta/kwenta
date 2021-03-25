import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isL2State, isWalletConnectedState } from 'store/wallet';
import Connector from 'containers/Connector';
import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const [, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();

	const switchToL2 = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);
			addOptimismNetworkToMetamask({ ethereum: window.ethereum });
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	return !isL2 ? (
		<Container onClick={switchToL2}>
			<Button>{t('header.networks-switcher.l2')}</Button>
		</Container>
	) : null;
};

export default NetworksSwitcher;

const Container = styled.div`
	margin: 4px 0;
	font-size: 12px;
	font-weight: bold;
	line-height: 1;
	cursor: pointer;
`;

const Button = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	height: 24px;
	padding: 0px 16px;
	background: ${(props) => props.theme.colors.elderberry};
	color: ${(props) => props.theme.colors.goldColors.color4};
	:hover {
		background: ${(props) => props.theme.colors.goldHover};
		color: ${(props) => props.theme.colors.white};
	}
`;
