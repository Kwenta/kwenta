import { useChainModal } from '@rainbow-me/rainbowkit';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import LinkIcon from 'assets/svg/app/link-blue.svg';
import SwitchIcon from 'assets/svg/app/switch.svg';
import ArbitrumIcon from 'assets/svg/providers/arbitrum.svg';
import AvalancheIcon from 'assets/svg/providers/avalanche.svg';
import BinanceIcon from 'assets/svg/providers/binance.svg';
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

type NetworksSwitcherProps = {
	mobile?: boolean;
};

const NetworksSwitcher: FC<NetworksSwitcherProps> = ({ mobile }) => {
	const { activeChain } = Connector.useContainer();
	const { t } = useTranslation();
	const { openChainModal } = useChainModal();
	const isL2 = useIsL2();

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
				return <PolygonIcon width={24} height={16} />;
			case 'Arbitrum One':
				return <ArbitrumIcon width={24} height={16} />;
			case 'Ethereum':
				return <EthereumIcon width={24} height={16} />;
			case 'Avalanche':
				return <AvalancheIcon width={24} height={16} />;
			case 'BNB Smart Chain':
				return <BinanceIcon width={24} height={16} />;
			default:
				return <OptimismIcon width={24} height={16} />;
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
				{!!prefixIcon && activeChain && <PrefixIcon>{networkIcon(activeChain.name)}</PrefixIcon>}
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Link' ? <LinkIcon width={14} height={14} /> : <SwitchIcon />)}
			</LabelContainer>
		</ExternalLink>
	);

	return !isL2 || mobile ? (
		<Container onClick={openChainModal} $mobile={mobile}>
			<StyledButton noOutline size="small" mono>
				{activeChain && networkIcon(activeChain.name)}
			</StyledButton>
		</Container>
	) : (
		<div>
			<L2Select
				formatOptionLabel={formatOptionLabel}
				controlHeight={41}
				options={OPTIMISM_OPTIONS}
				value={{ label: '', prefixIcon: 'Optimism' }}
				menuWidth={240}
				optionPadding="0px"
				components={{ IndicatorSeparator, DropdownIndicator }}
				isSearchable={false}
				variant="flat"
			/>
		</div>
	);
};

export default NetworksSwitcher;

const Container = styled.div<{ $mobile?: boolean }>`
	${(props) =>
		props.$mobile &&
		css`
			margin-right: 10px;
		`}
`;

const StyledButton = styled(Button)`
	width: 41px;
	padding: 0;
`;

const L2Select = styled(Select)`
	width: 41px;

	.react-select__single-value * {
		font-family: ${(props) => props.theme.fonts.mono};
	}

	.react-select__control {
		border-radius: 8px;
	}

	.react-select__dropdown-indicator {
		display: none;
	}

	.react-select__value-container {
		padding-right: 0;
	}
`;

const PrefixIcon = styled.span`
	display: flex;
`;
