import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import LinkIcon from 'assets/svg/app/link-blue.svg';
import SwitchIcon from 'assets/svg/app/switch.svg';
import OptimismIcon from 'assets/svg/providers/optimism.svg';
import Button from 'components/Button';
import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { IndicatorSeparator, DropdownIndicator } from 'components/Select/Select';
import { EXTERNAL_LINKS } from 'constants/links';
import BlockExplorer from 'containers/BlockExplorer';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { isL2State, networkState } from 'store/wallet';
import { ExternalLink } from 'styles/common';

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

	return !isL2 ? (
		<Container onClick={switchToL2}>
			<StyledButton noOutline size="sm">
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
