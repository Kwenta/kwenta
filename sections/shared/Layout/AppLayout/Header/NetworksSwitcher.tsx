import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isL2State, networkState } from 'store/wallet';
import Select from 'components/Select';
import { ExternalLink, FlexDivRowCentered } from 'styles/common';
import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import Button from 'components/Button';
import SwitchIcon from 'assets/svg/app/switch.svg';
import LinkIcon from 'assets/svg/app/link-blue.svg';
import OptimismIcon from 'assets/svg/providers/optimism.svg';
import BlockExplorer from 'containers/BlockExplorer';
import { components } from 'react-select';
import { IndicatorSeparator } from 'components/Select/Select';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { EXTERNAL_LINKS } from 'constants/links';

type ReactSelectOptionProps = {
	label: string;
	prefixIcon?: string;
	postfixIcon?: string;
	link?: string;
	onClick?: () => {};
};

type NetworksSwitcherProps = {};

const NetworksSwitcher: FC<NetworksSwitcherProps> = () => {
	const { switchToL1, switchToL2 } = useNetworkSwitcher();
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState).id === 69 ? 'testnet' : 'mainnet';
	const networkLabel = 'header.networks-switcher.optimism-' + network;
	const { blockExplorerInstance } = BlockExplorer.useContainer();

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
		<Container onClick={switchToL2}>
			<StyledButton noOutline={true} size="sm">
				{t('header.networks-switcher.l2')}
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
				noOutline={true}
			></L2Select>
		</Container>
	);
};

export default NetworksSwitcher;

const Container = styled.div`
	width: 100%;
	margin-left: 15px;
`;

const StyledButton = styled(Button)`
	font-size: 13px;
	min-width: 0px;
	font-family: ${(props) => props.theme.fonts.mono};
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
