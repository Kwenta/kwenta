import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';
import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';
import { NetworkId } from '@synthetixio/js';

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const [networkError, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();
	const network = useRecoilValue(networkState);
	const isL1 = !network?.useOvm ?? false;
	const isL2 = !isL1;
	console.log(network?.useOvm);

	const onToggleNetwork = async () => (isL1 ? switchToL2() : switchToL1());

	const switchToL1 = async () => {
		// const l2NetworkIsKovan = false;
		// await window.ethereum.request({
		// 	method: 'wallet_switchEthereumChain',
		// 	params: [
		// 		{
		// 			chainId: `0x${(l2NetworkIsKovan ? NetworkId.Kovan : NetworkId.Mainnet).toString(16)}`,
		// 		},
		// 	],
		// });
	};

	const switchToL2 = async () => {
		try {
			setNetworkError(null);
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				setNetworkError(t('user-menu.error.please-install-metamask'));
			} else addOptimismNetworkToMetamask({ ethereum: window.ethereum });
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	return (
		<Container onClick={onToggleNetwork}>
			<L1Button isActive={isL1}>{t('header.networks-switcher.l1')}</L1Button>
			<L2Button isActive={isL2}>{t('header.networks-switcher.l2')}</L2Button>
		</Container>
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
