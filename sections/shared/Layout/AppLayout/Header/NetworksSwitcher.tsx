import { useChainModal } from '@rainbow-me/rainbowkit';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { chain } from 'wagmi';

import LinkIcon from 'assets/svg/app/link-blue.svg';
import SwitchIcon from 'assets/svg/app/switch.svg';
import ArbitrumIcon from 'assets/svg/providers/arbitrum.svg';
import EthereumIcon from 'assets/svg/providers/ethereum.svg';
import OptimismIcon from 'assets/svg/providers/optimism.svg';
import PolygonIcon from 'assets/svg/providers/polygon.svg';
import Button from 'components/Button';
import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { IndicatorSeparator, DropdownIndicator } from 'components/Select/Select';
import { EXTERNAL_LINKS } from 'constants/links';
import Connector from 'containers/Connector';
import { blockExplorer } from 'containers/Connector/Connector';
import useIsL2 from 'hooks/useIsL2';
import { ExternalLink } from 'styles/common';

type ReactSelectOptionProps = {
	label: string;
	prefixIcon?: string;
	postfixIcon?: string;
	link?: string;
	onClick?: () => {};
};

const NetworksSwitcher: FC = () => {
	const { activeChain } = Connector.useContainer();
	const { openChainModal } = useChainModal();
	const { t } = useTranslation();
	const isL2 = useIsL2();
	const network = activeChain?.id === chain.optimismGoerli.id ? 'testnet' : 'mainnet';
	const networkLabel = 'header.networks-switcher.optimism-' + network;

	const OPTIMISM_OPTIONS = [
		{
			label: 'header.networks-switcher.chains',
			postfixIcon: 'Switch',
			onClick: openChainModal,
		},
		{
			label: 'header.networks-switcher.optimistic-gateway',
			postfixIcon: 'Link',
			link: 'https://gateway.optimism.io/',
		},
		{
			label: 'header.networks-switcher.optimistic-etherscan',
			postfixIcon: 'Link',
			link: blockExplorer.baseLink,
		},
		{
			label: 'header.networks-switcher.learn-more',
			postfixIcon: 'Link',
			link: EXTERNAL_LINKS.Docs.DocsRoot,
		},
	];

	const networkIcon = (prefixIcon: string) => {
		switch (prefixIcon) {
			case 'Polygon':
				return (
					<PrefixIcon>
						<PolygonIcon width={20} height={14} />
					</PrefixIcon>
				);
			case 'Arbitrum One':
				return (
					<PrefixIcon>
						<ArbitrumIcon width={20} height={14} />
					</PrefixIcon>
				);
			case 'Ethereum':
				return (
					<PrefixIcon>
						<EthereumIcon width={20} height={14} />
					</PrefixIcon>
				);
			default:
				return (
					<PrefixIcon>
						<OptimismIcon width={20} height={14} />
					</PrefixIcon>
				);
		}
	};

	const formatOptionLabel = ({
		label,
		prefixIcon,
		postfixIcon,
		link,
		onClick,
	}: ReactSelectOptionProps) => (
		<ExternalLink href={link} onClick={onClick}>
			<LabelContainer noPadding={!!prefixIcon}>
				{!!prefixIcon && activeChain && networkIcon(activeChain.name)}
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Link' ? <LinkIcon width={14} height={14} /> : <SwitchIcon />)}
			</LabelContainer>
		</ExternalLink>
	);

	return !isL2 ? (
		<Container onClick={openChainModal}>
			<StyledButton noOutline size="sm">
				{activeChain && networkIcon(activeChain.name)}
				{activeChain?.name}
			</StyledButton>
		</Container>
	) : (
		<Container>
			<L2Select
				formatOptionLabel={formatOptionLabel}
				controlHeight={41}
				options={OPTIMISM_OPTIONS}
				value={{ label: networkLabel, prefixIcon: 'Optimism' }}
				menuWidth={240}
				optionPadding="0px"
				components={{ IndicatorSeparator, DropdownIndicator }}
				isSearchable={false}
				variant="flat"
			/>
		</Container>
	);
};

export default NetworksSwitcher;

const Container = styled.div`
	width: 100%;
`;

const StyledButton = styled(Button)`
	font-size: 13px;
	min-width: 0px;
	font-family: ${(props) => props.theme.fonts.mono};
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const L2Select = styled(Select)`
	width: 137px;

	.react-select__single-value * {
		font-family: ${(props) => props.theme.fonts.mono};
	}

	.react-select__control {
		border-radius: 10px;
	}

	.react-select__dropdown-indicator {
		margin-right: 5px;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`;

const PrefixIcon = styled.span`
	display: flex;
	padding-right: 6px;
`;
