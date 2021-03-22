import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import {
	isL2State,
	isWalletConnectedState,
	//  isMainnetNetworkState,
} from 'store/wallet';
import Connector from 'containers/Connector';
import Tippy from '@tippyjs/react';
import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';
// import { NetworkId } from '@synthetixio/js';

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const [, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();
	// const isMainnetNetwork = useRecoilValue(isMainnetNetworkState);
	const isL2 = useRecoilValue(isL2State);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();

	const onToggleNetwork = async () => {
		if (!isWalletConnected) await connectWallet();
		isL2 ? switchToL1() : switchToL2();
	};

	const switchToL1 = async () => {
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);
			// await window.ethereum.request({
			// 	method: 'wallet_switchEthereumChain',
			// 	params: [
			// 		{
			// 			chainId: `0x${(isMainnetNetwork ? NetworkId.Mainnet : NetworkId.Kovan).toString(16)}`,
			// 		},
			// 	],
			// });
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	const switchToL2 = async () => {
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

	return (
		<Tooltip
			disabled={!isL2}
			arrow={false}
			content={t('header.networks-switcher.tip')}
			interactive={true}
		>
			<Container onClick={onToggleNetwork}>
				<L1Button isActive={!isL2}>{t('header.networks-switcher.l1')}</L1Button>
				<L2Button isActive={isL2}>{t('header.networks-switcher.l2')}</L2Button>
			</Container>
		</Tooltip>
	);
};

export default NetworksSwitcher;

const Container = styled.div`
	width: 64px;
	padding: 4px;
	margin: 4px 0;
	display: grid;
	grid-template-columns: 1fr 1fr;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	font-weight: bold;
	background: ${(props) => props.theme.colors.elderberry};
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	line-height: 1;
	cursor: pointer;
`;

const Button = styled.div<{ isActive: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(props) => (props.isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
	border-radius: 2px;
	height: 18px;
`;

const L1Button = styled(Button)<{ isActive: boolean }>`
	background: ${(props) => (props.isActive ? props.theme.colors.navy : 'transparent')};
	color: ${(props) => props.theme.colors[props.isActive ? 'white' : 'blueberry']};

	&:hover {
		color: ${(props) => props.theme.colors[props.isActive ? 'blueberry' : 'white']};
	}
`;

const L2Button = styled(Button)<{ isActive: boolean }>`
	background: ${(props) => (props.isActive ? props.theme.colors.gold : 'transparent')};
	color: ${(props) => props.theme.colors[props.isActive ? 'white' : 'blueberry']};

	&:hover {
		color: ${(props) =>
			props.isActive ? 'rgba(255, 255, 255, 0.8)' : props.theme.colors.goldColors.color1};
	}
`;

const Tooltip = styled(Tippy)`
	background: ${(props) => props.theme.colors.elderberry};
	border: 0.5px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	width: 180px;
	.tippy-content {
		text-align: center;
	}
`;
