import { useChainModal } from '@rainbow-me/rainbowkit';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { components } from 'react-select';
import styled from 'styled-components';
import { chain, useNetwork } from 'wagmi';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import LinkIcon from 'assets/svg/app/link-blue.svg';
import SwitchIcon from 'assets/svg/app/switch.svg';
import EthereumIcon from 'assets/svg/providers/ethereum.svg';
import OptimismIcon from 'assets/svg/providers/optimism.svg';
import Button from 'components/Button';
import Select from 'components/Select';
import { IndicatorSeparator } from 'components/Select/Select';
import { EXTERNAL_LINKS } from 'constants/links';
import { ExternalLink, FlexDivRowCentered } from 'styles/common';

type ReactSelectOptionProps = {
	label: string;
	prefixIcon?: string;
	postfixIcon?: string;
	link?: string;
	onClick?: () => {};
};

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const { chain: activeChain } = useNetwork();
	const { openChainModal } = useChainModal();
	const { t } = useTranslation();
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(activeChain?.id)
			: true;
	const network = activeChain?.id === 69 ? 'testnet' : 'mainnet';
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
			link: activeChain?.blockExplorers?.etherscan?.url,
		},
		{
			label: 'header.networks-switcher.learn-more',
			postfixIcon: 'Link',
			link: EXTERNAL_LINKS.Docs.DocsRoot,
		},
	];

	const formatOptionLabel = ({
		label,
		prefixIcon,
		postfixIcon,
		link,
		onClick,
	}: ReactSelectOptionProps) => (
		<ExternalLink href={link} onClick={onClick}>
			<LabelContainer noPadding={!!prefixIcon}>
				{prefixIcon === 'Optimism' && (
					<PrefixIcon>
						<OptimismIcon width={20} height={14} />
					</PrefixIcon>
				)}
				{t(label)}
				{postfixIcon &&
					(postfixIcon === 'Link' ? <LinkIcon width={14} height={14} /> : <SwitchIcon />)}
			</LabelContainer>
		</ExternalLink>
	);

	const DropdownIndicator = (props: any) => {
		return (
			<components.DropdownIndicator {...props}>
				<StyledCaretDownIcon />
			</components.DropdownIndicator>
		);
	};

	return !isL2 ? (
		<Container onClick={openChainModal}>
			<StyledButton noOutline size="sm">
				<PrefixIcon>
					<EthereumIcon width={20} height={14} />
				</PrefixIcon>
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
				optionPadding={'0px'} //override default padding to 0
				components={{ IndicatorSeparator, DropdownIndicator }}
				isSearchable={false}
				noOutline
			></L2Select>
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

const StyledCaretDownIcon = styled(CaretDownIcon)`
	width: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const LabelContainer = styled(FlexDivRowCentered)<{ noPadding: boolean }>`
	padding: ${(props) => !props.noPadding && '16px'};
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	:hover {
		> svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.icon.hover};
			}
		}
	}
	> svg {
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.icon.fill};
		}
	}
`;
