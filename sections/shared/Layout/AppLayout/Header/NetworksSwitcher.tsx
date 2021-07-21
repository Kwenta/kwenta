import { FC, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isL2State, isWalletConnectedState } from 'store/wallet';
import Connector from 'containers/Connector';
import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';
import Select from 'components/Select';
import Img, { Svg } from 'react-optimized-image';
import { ExternalLink, FlexDivRowCentered } from 'styles/common';
import CaretDownIcon from 'assets/svg/app/caret-down.svg';

import SwitchIcon from 'assets/svg/app/switch.svg';
import LinkIcon from 'assets/svg/app/link-blue.svg';
import OptimismIcon from 'assets/svg/providers/optimism.svg';
import BlockExplorer from 'containers/BlockExplorer';
import { utils, BigNumber } from 'ethers';
import { components } from 'react-select';
import { IndicatorSeparator } from 'components/Select/Select';

type ReactSelectOptionProps = {
	label: string;
	prefixIcon?: string;
	postfixIcon?: string;
	link?: string;
	onClick?: () => {};
};

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const [, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();
	const theme = useTheme();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const DropdownIndicator = (props: any) => {
		return (
			<components.DropdownIndicator {...props}>
				<StyledCaretDownIcon
					src={CaretDownIcon}
					viewBox={`0 0 ${CaretDownIcon.width} ${CaretDownIcon.height}`}
				/>
			</components.DropdownIndicator>
		);
	};

	const switchToL1 = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);

			//TODO: add to monorepo
			const formattedChainId = utils.hexStripZeros(BigNumber.from(42).toHexString());
			(window.ethereum as any).request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: formattedChainId }],
			});
			//ENDTODO
		} catch (e) {
			setNetworkError(e.message);
		}
	};

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

	const OPTIMISM_OPTIONS = [
		{ label: 'header.networks-switcher.l1', postfixIcon: 'Switch', onClick: switchToL1 },
		{
			label: 'header.networks-switcher.optimistic-gateway',
			postfixIcon: 'Link',
			link: 'https://gateway.optimism.io/',
		},
		{
			label: 'header.networks-switcher.optimistic-etherscan',
			postfixIcon: 'Link',
			link: blockExplorerInstance?.baseLink,
		},
		{
			label: 'header.networks-switcher.learn-more',
			postfixIcon: 'Link',
			link: 'https://blog.kwenta.io/',
		},
	];

	const formatOptionLabel = ({
		label,
		prefixIcon,
		postfixIcon,
		link,
		onClick,
	}: ReactSelectOptionProps) => (
		<ExternalLink href={link}>
			<FlexDivRowCentered onClick={onClick}>
				{prefixIcon === 'Optimism' && <PrefixIcon src={OptimismIcon} height={12} />}
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Link' ? <Svg src={LinkIcon} /> : <Svg src={SwitchIcon} />)}
			</FlexDivRowCentered>
		</ExternalLink>
	);

	return !isL2 ? (
		<Container onClick={switchToL2}>
			<Button>{t('header.networks-switcher.l2')}</Button>
		</Container>
	) : (
		<Container>
			<L2Select
				formatOptionLabel={formatOptionLabel}
				height={24}
				options={OPTIMISM_OPTIONS}
				value={{ label: 'Optimism', prefixIcon: 'Optimism' }}
				menuWidth={240}
				optionPadding={'16px'}
				optionBorderBottom={`1px solid ${theme.colors.navy}`}
				dropdownIndicatorColor={theme.colors.blueberry}
				dropdownIndicatorColorHover={theme.colors.blueberry}
				components={{ IndicatorSeparator, DropdownIndicator }}
			></L2Select>
		</Container>
	);
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

const L2Select = styled(Select)`
	width: 110px;
`;

const PrefixIcon = styled(Img)`
	padding-right: 6px;
`;

const StyledCaretDownIcon = styled(Svg)`
	width: 8px;
	color: ${(props) => props.theme.colors.blueberry};
	//margin-left: 7px;
`;
